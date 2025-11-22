import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Calendar, Plus, Edit, Trash2, Save, Clock } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const TIME_SLOTS = [
  { time: '9-10', startTime: '09:00', endTime: '10:00', label: '9:00 - 10:00' },
  { time: '10-11', startTime: '10:00', endTime: '11:00', label: '10:00 - 11:00' },
  { time: '11-12', startTime: '11:00', endTime: '12:00', label: '11:00 - 12:00' },
  { time: '12-1', startTime: '12:00', endTime: '13:00', label: '12:00 - 1:00 (Lunch)' },
  { time: '1-2', startTime: '13:00', endTime: '14:00', label: '1:00 - 2:00' },
  { time: '2-3', startTime: '14:00', endTime: '15:00', label: '2:00 - 3:00' },
  { time: '3-4', startTime: '15:00', endTime: '16:00', label: '3:00 - 4:00' },
  { time: '4-5', startTime: '16:00', endTime: '17:00', label: '4:00 - 5:00' }
];

export default function StructuredTimetableEditor() {
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotData, setSlotData] = useState({ subject: '', teacher: '' });

  useEffect(() => {
    fetchSections();
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      fetchTimetable(selectedSection);
    }
  }, [selectedSection]);

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/section`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSections(response.data || []);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/admin/teachers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    }
  };

  const fetchTimetable = async (sectionName) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/timetable/section/${sectionName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimetable(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        // Create empty timetable
        const emptySchedule = {};
        DAYS.forEach(day => {
          emptySchedule[day] = [];
        });
        setTimetable({ 
          section: sectionName, 
          schedule: emptySchedule 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditSlot = (day, timeSlot) => {
    const existingSlot = timetable?.schedule[day]?.find(s => s.time === timeSlot.time);
    setEditingSlot({ day, timeSlot });
    setSlotData({
      subject: existingSlot?.subject || '',
      teacher: existingSlot?.teacher?._id || existingSlot?.teacher || ''
    });
    setEditDialogOpen(true);
  };

  const handleSaveSlot = async () => {
    if (!slotData.subject) {
      toast.error('Subject is required');
      return;
    }

    const updatedSchedule = { ...timetable.schedule };
    
    // Remove existing slot for this time
    updatedSchedule[editingSlot.day] = updatedSchedule[editingSlot.day].filter(
      s => s.time !== editingSlot.timeSlot.time
    );

    // Add new/updated slot if subject is not empty
    if (slotData.subject.trim()) {
      updatedSchedule[editingSlot.day].push({
        time: editingSlot.timeSlot.time,
        startTime: editingSlot.timeSlot.startTime,
        endTime: editingSlot.timeSlot.endTime,
        subject: slotData.subject,
        teacher: slotData.teacher || null
      });

      // Sort by time
      updatedSchedule[editingSlot.day].sort((a, b) => 
        a.startTime.localeCompare(b.startTime)
      );
    }

    setTimetable({ ...timetable, schedule: updatedSchedule });
    setEditDialogOpen(false);
    toast.success('Slot updated! Remember to save the timetable.');
  };

  const handleDeleteSlot = (day, timeSlot) => {
    const updatedSchedule = { ...timetable.schedule };
    updatedSchedule[day] = updatedSchedule[day].filter(
      s => s.time !== timeSlot.time
    );
    setTimetable({ ...timetable, schedule: updatedSchedule });
    toast.success('Slot removed! Remember to save the timetable.');
  };

  const handleSaveTimetable = async () => {
    if (!timetable || !selectedSection) {
      toast.error('Please select a section');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Convert to the format expected by backend
      const timetableText = generateTimetableText(timetable);
      
      await axios.post(
        `${API}/timetable/upload`,
        { timetableText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Timetable saved successfully!');
      fetchTimetable(selectedSection);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save timetable');
    } finally {
      setLoading(false);
    }
  };

  const generateTimetableText = (timetable) => {
    let text = `${timetable.section}:\n`;
    DAYS.forEach(day => {
      const slots = timetable.schedule[day] || [];
      if (slots.length > 0) {
        const slotsText = slots
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
          .map(s => `${s.time} ${s.subject}`)
          .join(', ');
        text += `${day}: ${slotsText}\n`;
      }
    });
    return text;
  };

  const getSlotForTime = (day, timeSlot) => {
    return timetable?.schedule[day]?.find(s => s.time === timeSlot.time);
  };

  const loadMockData = () => {
    const mockSchedule = {
      MON: [
        { time: '9-10', startTime: '09:00', endTime: '10:00', subject: 'Data Structures', teacher: null },
        { time: '10-11', startTime: '10:00', endTime: '11:00', subject: 'Computer Organization', teacher: null },
        { time: '11-12', startTime: '11:00', endTime: '12:00', subject: 'Operating Systems', teacher: null },
        { time: '1-2', startTime: '13:00', endTime: '14:00', subject: 'Design & Analysis of Algorithms', teacher: null },
        { time: '2-3', startTime: '14:00', endTime: '15:00', subject: 'FLAT', teacher: null }
      ],
      TUE: [
        { time: '9-10', startTime: '09:00', endTime: '10:00', subject: 'Operating Systems', teacher: null },
        { time: '10-11', startTime: '10:00', endTime: '11:00', subject: 'Artificial Intelligence', teacher: null },
        { time: '11-12', startTime: '11:00', endTime: '12:00', subject: 'Data Structures', teacher: null },
        { time: '1-2', startTime: '13:00', endTime: '14:00', subject: 'Design & Analysis of Algorithms', teacher: null },
        { time: '2-3', startTime: '14:00', endTime: '15:00', subject: 'Computer Organization', teacher: null }
      ],
      WED: [
        { time: '9-10', startTime: '09:00', endTime: '10:00', subject: 'FLAT', teacher: null },
        { time: '10-11', startTime: '10:00', endTime: '11:00', subject: 'Data Structures Lab', teacher: null },
        { time: '11-12', startTime: '11:00', endTime: '12:00', subject: 'Data Structures Lab', teacher: null },
        { time: '1-2', startTime: '13:00', endTime: '14:00', subject: 'Operating Systems', teacher: null },
        { time: '2-3', startTime: '14:00', endTime: '15:00', subject: 'Artificial Intelligence', teacher: null }
      ],
      THU: [
        { time: '9-10', startTime: '09:00', endTime: '10:00', subject: 'Computer Organization', teacher: null },
        { time: '10-11', startTime: '10:00', endTime: '11:00', subject: 'FLAT', teacher: null },
        { time: '11-12', startTime: '11:00', endTime: '12:00', subject: 'Artificial Intelligence', teacher: null },
        { time: '1-2', startTime: '13:00', endTime: '14:00', subject: 'Data Structures', teacher: null },
        { time: '2-3', startTime: '14:00', endTime: '15:00', subject: 'Operating Systems', teacher: null }
      ],
      FRI: [
        { time: '9-10', startTime: '09:00', endTime: '10:00', subject: 'Design & Analysis of Algorithms', teacher: null },
        { time: '10-11', startTime: '10:00', endTime: '11:00', subject: 'OS Lab', teacher: null },
        { time: '11-12', startTime: '11:00', endTime: '12:00', subject: 'OS Lab', teacher: null },
        { time: '1-2', startTime: '13:00', endTime: '14:00', subject: 'FLAT', teacher: null },
        { time: '2-3', startTime: '14:00', endTime: '15:00', subject: 'Data Structures', teacher: null }
      ],
      SAT: []
    };

    setTimetable({ 
      section: selectedSection || 'CSE-A', 
      schedule: mockSchedule 
    });
    toast.success('Mock data loaded! You can now edit and save.');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-8 h-8 text-blue-600" />
          Structured Timetable Editor
        </h1>
      </div>

      {/* Section Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="section">Select Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section._id} value={section.name}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={loadMockData} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Load Mock Data
            </Button>
            <Button onClick={handleSaveTimetable} disabled={loading || !timetable}>
              <Save className="w-4 h-4 mr-2" />
              Save Timetable
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      {timetable && (
        <Card>
          <CardHeader>
            <CardTitle>Timetable for {timetable.section}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="font-bold">Time</TableHead>
                    {DAYS.map(day => (
                      <TableHead key={day} className="text-center font-bold">
                        {day}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TIME_SLOTS.map((timeSlot) => (
                    <TableRow key={timeSlot.time}>
                      <TableCell className="font-medium whitespace-nowrap bg-gray-50">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          {timeSlot.label}
                        </div>
                      </TableCell>
                      {DAYS.map(day => {
                        const slot = getSlotForTime(day, timeSlot);
                        return (
                          <TableCell 
                            key={`${day}-${timeSlot.time}`} 
                            className="text-center relative group"
                          >
                            {slot ? (
                              <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                <p className="font-semibold text-blue-900">{slot.subject}</p>
                                {slot.teacher && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    {teachers.find(t => t._id === slot.teacher)?.name || 'Teacher'}
                                  </p>
                                )}
                                <div className="hidden group-hover:flex absolute top-2 right-2 gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditSlot(day, timeSlot)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteSlot(day, timeSlot)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSlot(day, timeSlot)}
                                className="w-full h-full min-h-[60px] hover:bg-gray-100"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Slot Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Slot - {editingSlot?.day} {editingSlot?.timeSlot.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={slotData.subject}
                onChange={(e) => setSlotData({ ...slotData, subject: e.target.value })}
                placeholder="e.g., Data Structures"
              />
            </div>

            <div>
              <Label htmlFor="teacher">Assign Teacher (Optional)</Label>
              <Select 
                value={slotData.teacher} 
                onValueChange={(value) => setSlotData({ ...slotData, teacher: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSlot}>
                Save Slot
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
