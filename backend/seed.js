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
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URL, {
      dbName: process.env.DB_NAME || 'aits_csms'
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Admin.deleteMany({});
    await Department.deleteMany({});
    await Section.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data');

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
