const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Admin = require('./models/Admin');
const Department = require('./models/Department');
const Section = require('./models/Section');
const Notification = require('./models/Notification');

async function seedDatabase() {
      // --- BEGIN NEW MOCK DATA GENERATION ---
      const faker = require('faker');
      const Certificate = require('./models/Certificate');
      const Remark = require('./models/Remark');
      const Timetable = require('./models/Timetable');
      const Attendance = require('./models/Attendance');
      const Achievement = require('./models/Achievement');
      const IDCard = require('./models/IDCard');
      const Fee = require('./models/Fee');
      const HallTicket = require('./models/HallTicket');
      const Mentoring = require('./models/Mentoring');
      const Skill = require('./models/Skill');

      // Helper arrays
      const deptNames = [
        'Mechanical Engineering', 'Civil Engineering', 'Information Technology', 'Chemical Engineering',
        'Biotechnology', 'Aerospace Engineering', 'Automobile Engineering', 'Mining Engineering',
        'Metallurgical Engineering', 'Environmental Engineering'
      ];
      const sectionSuffixes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];

      // 1. Create 10 new departments with HODs
      let newDepartments = [];
      let newTeachers = [];
      for (let i = 0; i < 10; i++) {
        const dept = await Department.create({
          name: deptNames[i],
          code: deptNames[i].split(' ')[0].toUpperCase(),
          isActive: true
        });
        // Create HOD
        const hodPass = await bcrypt.hash('hod123', 10);
        const hod = await Teacher.create({
          name: faker.name.findName(),
          teacherId: `HOD${i+1}`,
          email: `hod${i+1}@aits.edu`,
          password: hodPass,
          departmentId: dept._id,
          subjects: [faker.name.jobArea()],
          experience: faker.datatype.number({min:10,max:25}),
          designation: 'HOD',
          phone: faker.phone.phoneNumber(),
          isApproved: true,
          isActive: true
        });
        dept.hodId = hod._id;
        await dept.save();
        newDepartments.push(dept);
        newTeachers.push(hod);
      }

      // 2. Create 20 new sections distributed across departments
      let newSections = [];
      for (let i = 0; i < 20; i++) {
        const dept = newDepartments[i % newDepartments.length];
        const section = await Section.create({
          name: `${dept.code}-${sectionSuffixes[i]}`,
          departmentId: dept._id,
          isActive: true
        });
        dept.sections.push(section._id);
        await dept.save();
        newSections.push(section);
      }

      // 3. Create 50 new students distributed across sections
      let newStudents = [];
      const studentPass = await bcrypt.hash('student123', 10);
      for (let i = 0; i < 50; i++) {
        const section = newSections[i % newSections.length];
        const dept = newDepartments[i % newDepartments.length];
        const name = faker.name.findName();
        const rollNumber = `25${dept.code}${String(i+1).padStart(3,'0')}`;
        const email = `student${i+1}@aits.edu`;
        const student = await Student.create({
          name,
          rollNumber,
          email,
          password: studentPass,
          departmentId: dept._id,
          sectionId: section._id,
          phone: faker.phone.phoneNumber(),
          guardianName: faker.name.findName(),
          guardianPhone: faker.phone.phoneNumber(),
          isApproved: true,
          isActive: true
        });
        section.studentIds.push(student._id);
        await section.save();
        newStudents.push(student);
      }

      // 4. Add certificates, remarks, attendance, achievements, ID cards, hall tickets, fee, mentoring, skills, timetables
      for (const student of newStudents) {
        // Certificates
        await Certificate.create({
          student: student._id,
          title: 'NPTEL Python',
          url: faker.internet.url(),
          type: 'nptel',
          status: 'approved',
          verifiedBy: newTeachers[0]._id
        });
        // Remarks
        await Remark.create({
          studentId: student._id,
          createdBy: newTeachers[0]._id,
          createdByModel: 'Teacher',
          createdByName: newTeachers[0].name,
          title: 'Good Performance',
          description: 'Consistent and attentive in class.',
          type: 'positive',
          category: 'academic',
          severity: 'low',
          academicYear: '2025-2026',
          semester: 1
        });
        // Attendance
        await Attendance.create({
          section: student.sectionId.toString(),
          sectionId: student.sectionId,
          subject: 'Mathematics',
          teacher: newTeachers[0]._id,
          date: new Date(),
          day: 'MON',
          time: '9-10',
          startTime: '09:00',
          endTime: '10:00',
          students: [{ studentId: student._id, status: 'present' }],
          markedBy: newTeachers[0]._id
        });
        // Achievements
        await Achievement.create({
          student: student._id,
          title: 'Hackathon Winner',
          description: 'Won 2nd place in inter-college hackathon.',
          type: 'hackathon',
          tags: ['coding','teamwork'],
          certificateUrl: faker.internet.url(),
          status: 'approved',
          verifiedBy: newTeachers[0]._id
        });
        // ID Card
        await IDCard.create({
          student: student._id,
          cardNumber: `ID${student.rollNumber}`,
          issueDate: new Date(),
          expiryDate: new Date(new Date().setFullYear(new Date().getFullYear()+4)),
          status: 'Active',
          photoUrl: faker.image.avatar()
        });
        // Hall Ticket
        await HallTicket.create({
          student: student._id,
          examName: 'Mid Term 2025',
          issueDate: new Date(),
          status: 'Active'
        });
        // Fee
        await Fee.create({
          student: student._id,
          amount: faker.datatype.number({min:20000,max:50000}),
          dueDate: new Date(new Date().setMonth(new Date().getMonth()+1)),
          status: 'Unpaid'
        });
        // Mentoring
        await Mentoring.create({
          mentor: newTeachers[0]._id,
          mentee: student._id,
          startDate: new Date(),
          notes: 'Assigned for academic guidance.'
        });
        // Skills
        const skill = await Skill.create({
          name: faker.hacker.noun(),
          description: faker.hacker.phrase(),
          students: [student._id]
        });
        // Timetable
        await Timetable.create({
          section: student.sectionId.toString(),
          sectionId: student.sectionId,
          department: student.departmentId.toString(),
          schedule: {
            MON: [{ time: '9-10', startTime: '09:00', endTime: '10:00', subject: 'Mathematics', teacher: newTeachers[0]._id }],
            TUE: [{ time: '10-11', startTime: '10:00', endTime: '11:00', subject: 'Physics', teacher: newTeachers[0]._id }],
            WED: [{ time: '11-12', startTime: '11:00', endTime: '12:00', subject: 'Chemistry', teacher: newTeachers[0]._id }],
            THU: [{ time: '12-1', startTime: '12:00', endTime: '13:00', subject: 'English', teacher: newTeachers[0]._id }],
            FRI: [{ time: '1-2', startTime: '13:00', endTime: '14:00', subject: 'Computer Science', teacher: newTeachers[0]._id }],
            SAT: [],
            SUN: []
          },
          uploadedBy: null,
          isActive: true
        });
      }
      // --- END NEW MOCK DATA GENERATION ---
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URL, {
      dbName: process.env.DB_NAME || 'aits_csms'
    });
    console.log('Connected to MongoDB');

    // Do NOT clear existing data. We will append new mock data.

    // Create Departments
    const cse = await Department.create({
      name: 'Computer Science Engineering',
      code: 'CSE',
      isActive: true
    });

    const ece = await Department.create({
      name: 'Electronics and Communication Engineering',
      code: 'ECE',
      isActive: true
    });

    const eee = await Department.create({
      name: 'Electrical and Electronics Engineering',
      code: 'EEE',
      isActive: true
    });

    console.log('Created departments');

    // Create Sections
    const cseSection1 = await Section.create({
      name: 'CSE-A',
      departmentId: cse._id,
      isActive: true
    });

    const cseSection2 = await Section.create({
      name: 'CSE-B',
      departmentId: cse._id,
      isActive: true
    });

    const eceSection1 = await Section.create({
      name: 'ECE-A',
      departmentId: ece._id,
      isActive: true
    });

    console.log('Created sections');

    // Update department with sections
    cse.sections = [cseSection1._id, cseSection2._id];
    await cse.save();
    ece.sections = [eceSection1._id];
    await ece.save();

    // Create Admin (Approved)
    const hashedAdminPass = await bcrypt.hash('admin123', 10);
    const admin = await Admin.create({
      name: 'Dr. Rajesh Kumar',
      adminId: 'ADMIN001',
      email: 'admin@aits.edu',
      password: hashedAdminPass,
      role: 'super_admin',
      departmentAccess: [cse._id, ece._id, eee._id],
      isApproved: true,
      isActive: true
    });
    console.log('Created admin');

    // Create Teachers (Approved)
    const hashedTeacherPass = await bcrypt.hash('teacher123', 10);
    
    const teacher1 = await Teacher.create({
      name: 'Prof. Priya Sharma',
      teacherId: 'TCH001',
      email: 'priya.sharma@aits.edu',
      password: hashedTeacherPass,
      departmentId: cse._id,
      subjects: ['Data Structures', 'Algorithms', 'Database Management'],
      assignedSections: [cseSection1._id],
      experience: 8,
      designation: 'Associate Professor',
      phone: '9876543210',
      isApproved: true,
      isActive: true
    });

    const teacher2 = await Teacher.create({
      name: 'Dr. Amit Patel',
      teacherId: 'TCH002',
      email: 'amit.patel@aits.edu',
      password: hashedTeacherPass,
      departmentId: cse._id,
      subjects: ['Operating Systems', 'Computer Networks'],
      assignedSections: [cseSection2._id],
      experience: 12,
      designation: 'Professor',
      phone: '9876543211',
      isApproved: true,
      isActive: true
    });

    const teacher3 = await Teacher.create({
      name: 'Prof. Sneha Reddy',
      teacherId: 'TCH003',
      email: 'sneha.reddy@aits.edu',
      password: hashedTeacherPass,
      departmentId: ece._id,
      subjects: ['Digital Electronics', 'Signal Processing'],
      assignedSections: [eceSection1._id],
      experience: 6,
      designation: 'Assistant Professor',
      phone: '9876543212',
      isApproved: true,
      isActive: true
    });

    console.log('Created teachers');

    // Update sections with teachers
    cseSection1.teacherId = teacher1._id;
    await cseSection1.save();
    cseSection2.teacherId = teacher2._id;
    await cseSection2.save();
    eceSection1.teacherId = teacher3._id;
    await eceSection1.save();

    // Update department with HOD
    cse.hodId = teacher2._id;
    await cse.save();

    // Create Students (Approved)
    const hashedStudentPass = await bcrypt.hash('student123', 10);
    
    const student1 = await Student.create({
      name: 'Rahul Verma',
      rollNumber: '21CS001',
      email: 'rahul.verma@student.aits.edu',
      password: hashedStudentPass,
      departmentId: cse._id,
      sectionId: cseSection1._id,
      phone: '9123456789',
      guardianName: 'Mr. Suresh Verma',
      guardianPhone: '9123456780',
      attendance: [
        { subject: 'Data Structures', date: new Date('2024-01-15'), status: 'present' },
        { subject: 'Data Structures', date: new Date('2024-01-16'), status: 'present' },
        { subject: 'Algorithms', date: new Date('2024-01-15'), status: 'present' },
        { subject: 'Algorithms', date: new Date('2024-01-16'), status: 'absent' },
        { subject: 'Database Management', date: new Date('2024-01-15'), status: 'present' }
      ],
      results: [
        { semester: 1, subject: 'Mathematics', marks: 85, grade: 'A', examType: 'Mid Term' },
        { semester: 1, subject: 'Physics', marks: 78, grade: 'B+', examType: 'Mid Term' },
        { semester: 1, subject: 'Programming', marks: 92, grade: 'A+', examType: 'Mid Term' }
      ],
      achievements: [
        {
          title: 'First Prize in Hackathon',
          description: 'Won first prize in college-level hackathon',
          date: new Date('2024-01-10')
        }
      ],
      backlogCount: 0,
      atRisk: false,
      isApproved: true,
      isActive: true
    });

    const student2 = await Student.create({
      name: 'Ananya Singh',
      rollNumber: '21CS002',
      email: 'ananya.singh@student.aits.edu',
      password: hashedStudentPass,
      departmentId: cse._id,
      sectionId: cseSection1._id,
      phone: '9123456790',
      guardianName: 'Mr. Rakesh Singh',
      guardianPhone: '9123456781',
      attendance: [
        { subject: 'Data Structures', date: new Date('2024-01-15'), status: 'present' },
        { subject: 'Data Structures', date: new Date('2024-01-16'), status: 'present' },
        { subject: 'Algorithms', date: new Date('2024-01-15'), status: 'present' },
        { subject: 'Algorithms', date: new Date('2024-01-16'), status: 'present' }
      ],
      results: [
        { semester: 1, subject: 'Mathematics', marks: 88, grade: 'A', examType: 'Mid Term' },
        { semester: 1, subject: 'Physics', marks: 82, grade: 'A-', examType: 'Mid Term' }
      ],
      backlogCount: 0,
      atRisk: false,
      isApproved: true,
      isActive: true
    });

    const student3 = await Student.create({
      name: 'Karthik Reddy',
      rollNumber: '21CS003',
      email: 'karthik.reddy@student.aits.edu',
      password: hashedStudentPass,
      departmentId: cse._id,
      sectionId: cseSection2._id,
      phone: '9123456791',
      guardianName: 'Mr. Venkat Reddy',
      guardianPhone: '9123456782',
      attendance: [
        { subject: 'Operating Systems', date: new Date('2024-01-15'), status: 'absent' },
        { subject: 'Operating Systems', date: new Date('2024-01-16'), status: 'absent' },
        { subject: 'Computer Networks', date: new Date('2024-01-15'), status: 'late' }
      ],
      results: [
        { semester: 1, subject: 'Mathematics', marks: 45, grade: 'F', examType: 'Mid Term' },
        { semester: 1, subject: 'Physics', marks: 52, grade: 'D', examType: 'Mid Term' }
      ],
      backlogCount: 2,
      atRisk: true,
      isApproved: true,
      isActive: true
    });

    const student4 = await Student.create({
      name: 'Meera Nair',
      rollNumber: '21ECE001',
      email: 'meera.nair@student.aits.edu',
      password: hashedStudentPass,
      departmentId: ece._id,
      sectionId: eceSection1._id,
      phone: '9123456792',
      guardianName: 'Mr. Suresh Nair',
      guardianPhone: '9123456783',
      attendance: [
        { subject: 'Digital Electronics', date: new Date('2024-01-15'), status: 'present' },
        { subject: 'Signal Processing', date: new Date('2024-01-15'), status: 'present' }
      ],
      results: [
        { semester: 1, subject: 'Electronics', marks: 90, grade: 'A+', examType: 'Mid Term' }
      ],
      backlogCount: 0,
      atRisk: false,
      isApproved: true,
      isActive: true
    });

    console.log('Created students');

    // Add remarks to students
    student1.remarks.push({
      teacherId: teacher1._id,
      remark: 'Excellent performance in class. Shows great interest in programming.',
      type: 'positive',
      date: new Date()
    });

    student3.remarks.push({
      teacherId: teacher2._id,
      remark: 'Poor attendance. Needs improvement in academics. Please meet for counseling.',
      type: 'negative',
      date: new Date()
    });

    await student1.save();
    await student3.save();

    // Update sections with student IDs
    cseSection1.studentIds = [student1._id, student2._id];
    await cseSection1.save();
    cseSection2.studentIds = [student3._id];
    await cseSection2.save();
    eceSection1.studentIds = [student4._id];
    await eceSection1.save();

    // Create Notifications
    await Notification.create({
      title: 'Welcome to AITS CSMS',
      message: 'Welcome to the Centralized Student Management System. Please keep your profile updated.',
      postedBy: admin._id,
      postedByModel: 'Admin',
      target: 'all',
      date: new Date()
    });

    await Notification.create({
      title: 'Mid-term Exams Schedule',
      message: 'Mid-term examinations will be conducted from February 15-25, 2024.',
      postedBy: admin._id,
      postedByModel: 'Admin',
      target: 'student',
      date: new Date()
    });

    console.log('Created notifications');

    console.log('\n=== MOCK DATA CREATED SUCCESSFULLY ===\n');
    console.log('LOGIN CREDENTIALS:\n');
    console.log('1. ADMIN:');
    console.log('   Email: admin@aits.edu');
    console.log('   Password: admin123');
    console.log('   Role: admin\n');
    
    console.log('2. TEACHER:');
    console.log('   Email: priya.sharma@aits.edu');
    console.log('   Password: teacher123');
    console.log('   Role: teacher\n');
    
    console.log('3. STUDENT:');
    console.log('   Email: rahul.verma@student.aits.edu');
    console.log('   Password: student123');
    console.log('   Role: student\n');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
