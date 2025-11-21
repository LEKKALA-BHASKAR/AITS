# AITS Centralized Student Management System (CSMS)

A comprehensive, enterprise-grade student management system built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring role-based access control, advanced analytics, cloud storage integration, and real-time notifications.

## 🌟 Recent Updates (v2.0.0)

### New Backend Features
- ✅ **Notifications API** - Targeted announcements with role-based filtering
- ✅ **Remarks API** - Enhanced student remark management with statistics
- ✅ **Analytics API** - 8 comprehensive endpoints for data visualization
- ✅ **Security** - CodeQL scan passed with 0 vulnerabilities

### New Frontend Features
- ✅ **FileUpload Component** - Reusable Cloudinary integration
- ✅ **DataTable Component** - Advanced table with search, filter, and export
- ✅ **Charts Library** - 6 interactive chart components using Recharts
- ✅ **Admin Pages** - Department/Section management, Notification creator, Analytics dashboard
- ✅ **Student Pages** - Notifications center, Support tickets system

See [NEW_FEATURES.md](./NEW_FEATURES.md) for detailed documentation.

## 🌟 Core Features

### Core Functionality
- **Multi-Role Authentication**: Separate dashboards for Admin, Teacher, and Student roles
- **JWT-Based Security**: Secure token authentication with role-based access control
- **Cloud Storage Integration**: Cloudinary integration for profile images and certificates
- **Real-time Analytics**: Comprehensive dashboards with charts and statistics
- **Risk Detection System**: Automated identification of at-risk students
- **Support Ticket System**: Issue tracking and resolution workflow
- **Certificate Management**: Upload, review, and approval workflow for student achievements

### Admin Panel
- **Complete System Control**: Manage all aspects of the college system
- **Department Management**: CRUD operations with HOD assignment
- **Section Management**: Create and manage class sections with teacher assignments
- **Student Management**: 
  - Full CRUD operations
  - Profile image uploads
  - Academic history tracking
  - Behavior monitoring
  - Section transfers
  - Bulk operations
- **Teacher Management**:
  - CRUD operations
  - Subject and section assignments
  - Profile management
- **User Approvals**: Approve/reject new registrations
- **Global Announcements**: Notifications to specific targets (all, department, section, etc.)
- **Advanced Analytics**:
  - Department-wise statistics
  - Attendance analytics
  - Top performers tracking
  - At-risk student identification
  - Login activity monitoring
  - Backlog statistics
- **Login Logs**: Track all authentication attempts
- **Export Functionality**: CSV export for student data

### Teacher Panel
- **Profile Management**: Update profile with image upload
- **Section Overview**: View assigned sections and students
- **Attendance Management**:
  - Mark daily attendance
  - Bulk attendance marking
  - View attendance statistics
- **Results Management**:
  - Add/update exam marks
  - Auto-grade calculation
- **Student Monitoring**:
  - Add remarks (positive/negative/neutral)
  - View complete student profiles
  - Track behavior and performance
- **Certificate Approval**: Review and approve student certificates
- **Section Analytics**: Statistics for assigned sections

### Student Panel
- **Profile Management**:
  - View/update profile
  - Upload profile image
  - Update contact information
- **Attendance Tracking**:
  - Subject-wise attendance
  - Attendance percentage
  - Low attendance warnings
- **Results & Performance**:
  - Semester-wise marks
  - GPA calculation
  - Backlog status
- **Achievements**:
  - Upload certificates
  - Track approvals
  - View achievement history
- **Remarks**: View teacher/admin feedback
- **Notifications**: Receive announcements
- **Support Tickets**: Report issues and track resolution

## 🛡️ Security Features

- **Helmet.js**: Secure HTTP headers
- **Rate Limiting**: Protection against brute force attacks
  - General API: 100 req/15min
  - Auth endpoints: 5 attempts/15min
  - File uploads: 20 uploads/hour
- **Input Sanitization**: Protection against NoSQL injection and XSS
- **CORS Configuration**: Configurable origin restrictions
- **Password Encryption**: bcrypt hashing with salt
- **Login Tracking**: Complete audit trail of authentication attempts
- **Account Locking**: Auto-lock after failed login attempts
- **JWT Token Security**: 7-day expiry with role-based permissions

## 🚀 Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for cloud storage
- **bcryptjs** for password hashing
- **Helmet** for security headers
- **express-rate-limit** for rate limiting
- **express-mongo-sanitize** for NoSQL injection protection
- **xss-clean** for XSS protection

### Frontend
- **React 19** with React Router
- **Tailwind CSS** for styling
- **Radix UI** components
- **Shadcn/ui** component library
- **Axios** for API calls
- **Lucide React** for icons
- **Sonner** for toast notifications
- **React Hook Form** with Zod validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Cloudinary account (for image uploads)
- npm or yarn package manager

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/LEKKALA-BHASKAR/AITS.git
cd AITS
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
MONGO_URL="your_mongodb_connection_string"
DB_NAME="aits_csms"
PORT=8001
CORS_ORIGINS="http://localhost:3000"
JWT_SECRET="your_secure_jwt_secret"
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
NODE_ENV="development"
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:8001/api
```

### 4. Start the Application

**Backend:**
```bash
cd backend
npm start
# Server runs on http://localhost:8001
```

**Frontend:**
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

## 📚 API Documentation

Detailed API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🗄️ Database Models

### Core Models
- **Student**: Student information, attendance, results, achievements
- **Teacher**: Teacher information, assigned sections, subjects
- **Admin**: Admin information, department access, permissions
- **Department**: Department details, HOD assignment
- **Section**: Class sections, assigned students and teachers
- **Notification**: System-wide announcements

### Additional Models
- **LoginLog**: Authentication attempt tracking
- **SupportTicket**: Issue tracking and resolution
- **CertificateApproval**: Certificate upload and approval workflow

## 🎯 Risk Detection System

The system automatically identifies at-risk students based on:
- Attendance percentage < 65%
- More than 2 backlogs
- More than 3 negative remarks
- Average marks < 40%

At-risk students are highlighted in admin and teacher dashboards for intervention.

## 📊 Analytics Features

### Admin Analytics
- Department-wise student distribution
- Attendance trends and patterns
- Top performing students
- Backlog statistics
- Login activity graphs
- At-risk student tracking

### Teacher Analytics
- Section-wise performance metrics
- Average attendance by section
- Student progress tracking
- Behavior trend analysis

### Student Analytics
- Individual attendance percentage
- GPA calculation
- Performance trends
- Achievement tracking

## 🔐 User Roles & Permissions

### Super Admin
- Full system access
- User management (create, approve, deactivate)
- Department and section management
- Analytics and reports
- System configuration

### Department Admin
- Limited to assigned departments
- Student and teacher management within department
- Section management
- Department-level analytics

### Teacher
- View assigned sections
- Manage student attendance and marks
- Add remarks and feedback
- Approve certificates
- Section-level analytics

### Student
- View own profile and academic data
- Update limited profile fields
- Upload certificates
- Create support tickets
- View notifications

## 📸 File Upload Specifications

### Profile Images
- **Formats**: JPEG, PNG
- **Max Size**: 5MB
- **Storage**: Cloudinary
- **Transformation**: Auto-resize to 500x500px

### Certificates
- **Formats**: JPEG, PNG, PDF
- **Max Size**: 5MB
- **Storage**: Cloudinary
- **Workflow**: Upload → Review → Approval → Achievement

## 🎨 Frontend Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Radix UI + Shadcn/ui components
- **Form Validation**: React Hook Form with Zod schemas
- **Toast Notifications**: User feedback with Sonner
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: Comprehensive error boundaries
- **Dark Mode Ready**: Theme support infrastructure

## 📦 Build for Production

### Backend
```bash
cd backend
npm run build
```

### Frontend
```bash
cd frontend
npm run build
```

## 🚀 Deployment

### Backend (Render/Railway)
1. Create new web service
2. Connect to GitHub repository
3. Set environment variables
4. Deploy from `backend` directory

### Frontend (Vercel/Netlify)
1. Create new site
2. Connect to GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Add environment variables

### Database (MongoDB Atlas)
1. Create cluster
2. Configure network access
3. Create database user
4. Get connection string
5. Update backend `.env`

## 📝 Environment Variables Reference

### Backend Variables
| Variable | Description | Required |
|----------|-------------|----------|
| MONGO_URL | MongoDB connection string | Yes |
| DB_NAME | Database name | Yes |
| PORT | Server port | No (default: 8001) |
| CORS_ORIGINS | Allowed origins (comma-separated) | Yes |
| JWT_SECRET | JWT signing secret | Yes |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | Yes |
| CLOUDINARY_API_KEY | Cloudinary API key | Yes |
| CLOUDINARY_API_SECRET | Cloudinary API secret | Yes |
| NODE_ENV | Environment (development/production) | No |

### Frontend Variables
| Variable | Description | Required |
|----------|-------------|----------|
| REACT_APP_API_URL | Backend API URL | Yes |

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **LEKKALA BHASKAR** - Initial work

## 🙏 Acknowledgments

- AITS College for project requirements
- Open source community for amazing tools and libraries
- All contributors who help improve this system

## 📞 Support

For support, email support@aits.edu or create an issue in the repository.

---

Made with ❤️ by the AITS Development Team

