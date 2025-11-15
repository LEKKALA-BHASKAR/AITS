# AITS CSMS - Quick Start Guide

Get the AITS Centralized Student Management System running in under 10 minutes!

## ⚡ Prerequisites

- Node.js v16+ installed
- MongoDB (local or Atlas account)
- Cloudinary account (for file uploads)

## 🚀 Quick Setup

### 1. Clone and Install (2 minutes)

```bash
# Clone repository
git clone https://github.com/LEKKALA-BHASKAR/AITS.git
cd AITS

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend (3 minutes)

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env file with your credentials
# Minimum required:
# - MONGO_URL (your MongoDB connection string)
# - JWT_SECRET (any random string, min 32 chars)
# - CLOUDINARY_CLOUD_NAME
# - CLOUDINARY_API_KEY
# - CLOUDINARY_API_SECRET
```

**Quick MongoDB Setup (if needed):**
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create free cluster
- Get connection string
- Paste in `.env` file

**Quick Cloudinary Setup:**
- Go to [Cloudinary](https://cloudinary.com)
- Sign up for free
- Copy credentials from dashboard
- Paste in `.env` file

### 3. Seed Database (1 minute)

```bash
# Still in backend directory
node seed.js
```

This creates:
- 1 Admin (admin@aits.edu / admin123)
- 2 Departments
- 2 Sections  
- 5 Teachers
- 20 Students

### 4. Start Application (1 minute)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Server runs on http://localhost:8001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# App opens on http://localhost:3000
```

### 5. Login and Explore (2 minutes)

Open http://localhost:3000

**Admin Login:**
- Email: `admin@aits.edu`
- Password: `admin123`
- Role: Admin

**Test Features:**
- ✅ View dashboard statistics
- ✅ Browse students list
- ✅ Check analytics
- ✅ View departments
- ✅ Manage approvals

## 🧪 Test API with Postman

1. Open Postman
2. Import `AITS_CSMS_Postman_Collection.json`
3. Set environment variable: `baseUrl` = `http://localhost:8001/api`
4. Run "Login - Admin" request
5. Token auto-saves, test other endpoints!

## 📝 Default Accounts Created by Seed

**Admin:**
- admin@aits.edu / admin123

**Teachers:**
- teacher1@aits.edu / teacher123
- teacher2@aits.edu / teacher123
- teacher3@aits.edu / teacher123
- teacher4@aits.edu / teacher123
- teacher5@aits.edu / teacher123

**Students:**
- student1@aits.edu / student123
- student2@aits.edu / student123
- ... up to student20@aits.edu

## 🎯 Quick Feature Test

### Upload Profile Image
1. Login as student/teacher
2. Go to Profile
3. Click upload image
4. Select image (max 5MB)
5. Image appears instantly!

### Certificate Workflow
1. Login as student
2. Upload certificate
3. Logout, login as teacher
4. View pending certificates
5. Approve certificate
6. Login back as student
7. Check achievements - approved certificate appears!

### Support Ticket
1. Login as student
2. Create support ticket
3. Logout, login as admin
4. View tickets
5. Add response
6. Update status to resolved

### Risk Detection
1. Login as admin
2. Go to Analytics
3. Click "Update Risk Status"
4. View at-risk students with reasons

## 📚 Documentation

- **Full Setup**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **API Reference**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Implementation Details**: See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Project Overview**: See [README.md](./README.md)

## 🔧 Common Quick Fixes

### Backend won't start
```bash
# Check if MongoDB is accessible
# Update MONGO_URL in .env

# Check if port 8001 is free
# Change PORT in .env if needed
```

### Frontend won't connect to backend
```bash
# Create frontend/.env file
echo "REACT_APP_API_URL=http://localhost:8001/api" > frontend/.env

# Restart frontend
```

### Cannot upload files
```bash
# Verify Cloudinary credentials in backend/.env
# Check if values are correct (no quotes needed)
```

## 🎓 Learning Path

**Day 1: Basics**
- ✅ Setup and run application
- ✅ Login with different roles
- ✅ Explore dashboards

**Day 2: Student Management**
- ✅ Create departments and sections
- ✅ Add students and teachers
- ✅ Upload profile images

**Day 3: Academic Features**
- ✅ Mark attendance
- ✅ Add exam results
- ✅ Add teacher remarks

**Day 4: Advanced Features**
- ✅ Certificate workflow
- ✅ Support tickets
- ✅ Risk detection

**Day 5: Analytics**
- ✅ View department statistics
- ✅ Check login logs
- ✅ Export data

## 🚀 Production Deployment Quick Links

**Backend:**
- [Render](https://render.com) - Free tier available
- [Railway](https://railway.app) - Free tier available

**Frontend:**
- [Vercel](https://vercel.com) - Free for hobby projects
- [Netlify](https://netlify.com) - Free tier available

**Database:**
- [MongoDB Atlas](https://mongodb.com/atlas) - Free 512MB cluster

**Storage:**
- [Cloudinary](https://cloudinary.com) - Free 25GB/month

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed deployment instructions.

## 💡 Tips

- Use Postman collection to test APIs before building UI
- Check browser console for frontend errors
- Check terminal for backend errors
- MongoDB Compass is great for viewing database
- Risk detection runs automatically at 2 AM daily
- Rate limiting resets every 15 minutes

## 🆘 Need Help?

1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed troubleshooting
2. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API details
3. Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for feature status
4. Create issue on GitHub repository

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Backend starts without errors
- [ ] Frontend starts and opens in browser
- [ ] Can login as admin
- [ ] Dashboard shows statistics
- [ ] Can view students list
- [ ] Can upload profile image
- [ ] Can create support ticket
- [ ] Analytics page loads
- [ ] Risk detection works

If all checked, you're ready to develop! 🎉

---

**Time to Complete**: ~10 minutes
**Difficulty**: Beginner friendly
**Support**: Full documentation available

Happy coding! 🚀
