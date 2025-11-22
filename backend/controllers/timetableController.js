const Timetable = require('../models/Timetable');
const Section = require('../models/Section');
const Teacher = require('../models/Teacher');
const TimetableParser = require('../utils/TimetableParser');

module.exports = {
  /**
   * Upload and parse timetable from plain text
   * POST /api/timetable/upload
   */
  async uploadTimetable(req, res) {
    try {
      const { timetableText } = req.body;

      if (!timetableText) {
        return res.status(400).json({ error: 'Timetable text is required' });
      }

      // Parse the timetable text
      let parsedTimetables;
      try {
        parsedTimetables = TimetableParser.parse(timetableText);
      } catch (parseError) {
        return res.status(400).json({ 
          error: 'Failed to parse timetable', 
          details: parseError.message 
        });
      }

      // Validate parsed timetables
      const validation = TimetableParser.validate(parsedTimetables);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Timetable validation failed',
          errors: validation.errors,
          warnings: validation.warnings
        });
      }

      // Save timetables to database
      const savedTimetables = [];
      const errors = [];

      for (const parsedTimetable of parsedTimetables) {
        try {
          // Find section by name
          const section = await Section.findOne({ name: parsedTimetable.section });
          
          // Auto-assign teachers based on subject
          const scheduleWithTeachers = {};
          for (const [day, slots] of Object.entries(parsedTimetable.schedule)) {
            scheduleWithTeachers[day] = await Promise.all(
              slots.map(async (slot) => {
                // Try to find a teacher who teaches this subject
                const teacher = await Teacher.findOne({ 
                  subjects: slot.subject,
                  isActive: true 
                });
                
                return {
                  ...slot,
                  teacher: teacher ? teacher._id : null
                };
              })
            );
          }

          // Update or create timetable
          const timetable = await Timetable.findOneAndUpdate(
            { section: parsedTimetable.section },
            {
              section: parsedTimetable.section,
              sectionId: section ? section._id : null,
              department: section ? await section.populate('departmentId').then(s => s.departmentId?.code) : null,
              schedule: scheduleWithTeachers,
              uploadedBy: req.user?.id,
              isActive: true,
              updatedAt: Date.now()
            },
            { 
              new: true, 
              upsert: true,
              runValidators: true 
            }
          );

          savedTimetables.push(timetable);
        } catch (err) {
          errors.push({
            section: parsedTimetable.section,
            error: err.message
          });
        }
      }

      res.status(201).json({
        message: 'Timetable uploaded successfully',
        timetables: savedTimetables,
        warnings: validation.warnings,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Get timetable for a specific section
   * GET /api/timetable/section/:sectionName
   */
  async getTimetableBySection(req, res) {
    try {
      const { sectionName } = req.params;
      
      const timetable = await Timetable.findBySection(sectionName)
        .populate('sectionId', 'name')
        .populate('schedule.MON.teacher schedule.TUE.teacher schedule.WED.teacher schedule.THU.teacher schedule.FRI.teacher schedule.SAT.teacher schedule.SUN.teacher', 'name teacherId');
      
      if (!timetable) {
        return res.status(404).json({ error: 'Timetable not found for this section' });
      }

      res.json(timetable);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Get today's timetable for a section
   * GET /api/timetable/today/:sectionName
   */
  async getTodaySchedule(req, res) {
    try {
      const { sectionName } = req.params;
      
      const timetable = await Timetable.findBySection(sectionName)
        .populate('schedule.MON.teacher schedule.TUE.teacher schedule.WED.teacher schedule.THU.teacher schedule.FRI.teacher schedule.SAT.teacher schedule.SUN.teacher', 'name teacherId email');
      
      if (!timetable) {
        return res.status(404).json({ error: 'Timetable not found for this section' });
      }

      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const today = days[new Date().getDay()];
      const todaySchedule = timetable.getScheduleForDay(today);

      res.json({
        section: timetable.section,
        day: today,
        date: new Date().toISOString().split('T')[0],
        schedule: todaySchedule
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Get teacher's today's periods across all sections
   * GET /api/timetable/teacher/today
   */
  async getTeacherTodaySchedule(req, res) {
    try {
      const teacherId = req.user.id;
      
      // Get all timetables
      const timetables = await Timetable.find({ isActive: true })
        .populate('sectionId', 'name');

      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const today = days[new Date().getDay()];

      const teacherPeriods = [];

      for (const timetable of timetables) {
        const todaySchedule = timetable.getScheduleForDay(today);
        
        for (const slot of todaySchedule) {
          if (slot.teacher && slot.teacher.toString() === teacherId) {
            teacherPeriods.push({
              section: timetable.section,
              sectionId: timetable.sectionId,
              time: slot.time,
              startTime: slot.startTime,
              endTime: slot.endTime,
              subject: slot.subject
            });
          }
        }
      }

      // Sort by start time
      teacherPeriods.sort((a, b) => a.startTime.localeCompare(b.startTime));

      res.json({
        day: today,
        date: new Date().toISOString().split('T')[0],
        periods: teacherPeriods
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Get current slot for a section (for auto-attendance)
   * GET /api/timetable/current-slot/:sectionName
   */
  async getCurrentSlot(req, res) {
    try {
      const { sectionName } = req.params;
      
      const timetable = await Timetable.findBySection(sectionName)
        .populate('schedule.MON.teacher schedule.TUE.teacher schedule.WED.teacher schedule.THU.teacher schedule.FRI.teacher schedule.SAT.teacher schedule.SUN.teacher', 'name teacherId');
      
      if (!timetable) {
        return res.status(404).json({ error: 'Timetable not found for this section' });
      }

      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const today = days[new Date().getDay()];
      const currentSlot = timetable.getCurrentSlot(today);

      if (!currentSlot) {
        return res.json({ 
          message: 'No class in session currently',
          currentSlot: null 
        });
      }

      res.json({
        section: timetable.section,
        day: today,
        currentSlot
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Get all timetables (for admin/HOD)
   * GET /api/timetable
   */
  async getTimetables(req, res) {
    try {
      const timetables = await Timetable.find({ isActive: true })
        .populate('sectionId', 'name')
        .populate('uploadedBy', 'name email')
        .sort({ section: 1 });
      
      res.json(timetables);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Delete timetable for a section
   * DELETE /api/timetable/:sectionName
   */
  async deleteTimetable(req, res) {
    try {
      const { sectionName } = req.params;
      
      const timetable = await Timetable.findOneAndUpdate(
        { section: sectionName },
        { isActive: false },
        { new: true }
      );

      if (!timetable) {
        return res.status(404).json({ error: 'Timetable not found' });
      }

      res.json({ message: 'Timetable deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Legacy endpoints for backward compatibility
  async createTimetable(req, res) {
    try {
      const timetable = await Timetable.create(req.body);
      res.status(201).json(timetable);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
