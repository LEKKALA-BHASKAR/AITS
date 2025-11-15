# AITS CSMS - Setup and Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Setup](#database-setup)
4. [Cloudinary Setup](#cloudinary-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Production Deployment](#production-deployment)
8. [Testing](#testing)
9. [Common Issues](#common-issues)

---

## Prerequisites

### Required Software
- **Node.js**: v16.x or higher ([Download](https://nodejs.org/))
- **MongoDB**: v5.x or higher ([Download](https://www.mongodb.com/try/download/community))
- **npm** or **yarn**: Latest version
- **Git**: Latest version

### Required Accounts
- **MongoDB Atlas Account** (for cloud database) - [Sign Up](https://www.mongodb.com/cloud/atlas/register)
- **Cloudinary Account** (for file storage) - [Sign Up](https://cloudinary.com/users/register/free)

### Optional but Recommended
- **Postman** for API testing - [Download](https://www.postman.com/downloads/)
- **VS Code** or your preferred IDE
- **MongoDB Compass** for database management - [Download](https://www.mongodb.com/try/download/compass)

---

## Local Development Setup

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

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## Database Setup

### Option 1: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create Cluster**
   - Click "Build a Database"
   - Select "FREE" tier (M0 Sandbox)
   - Choose your preferred region
   - Click "Create Cluster"

3. **Configure Database Access**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Create username and password (save these!)
   - Set role to "Atlas Admin"

4. **Configure Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your server's IP address

5. **Get Connection String**
   - Go to "Database" → Click "Connect"
   - Select "Connect your application"
   - Choose "Node.js" driver
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `aits_csms`

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/aits_csms
```

### Option 2: Local MongoDB

1. **Install MongoDB Community Edition**
   - Follow [installation guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB Service**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. **Connection String**
   ```
   mongodb://localhost:27017/aits_csms
   ```

---

## Cloudinary Setup

1. **Create Account**
   - Go to [Cloudinary](https://cloudinary.com/users/register/free)
   - Sign up for free account

2. **Get Credentials**
   - After login, go to Dashboard
   - Find your credentials:
     - **Cloud Name**
     - **API Key**
     - **API Secret**

3. **Configure Upload Presets (Optional)**
   - Go to Settings → Upload
   - Create upload preset with auto-optimization enabled

---

## Environment Configuration

### Backend Environment Variables

1. **Copy Example File**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env` File**
   ```env
   # MongoDB Configuration
   MONGO_URL="your_mongodb_connection_string"
   DB_NAME="aits_csms"
   
   # Server Configuration
   PORT=8001
   CORS_ORIGINS="http://localhost:3000"
   
   # JWT Secret (generate a secure random string)
   JWT_SECRET="your_super_secret_jwt_key_min_32_chars"
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   
   # Node Environment
   NODE_ENV="development"
   ```

3. **Generate Secure JWT Secret**
   ```bash
   # Using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Or online: https://randomkeygen.com/
   ```

### Frontend Environment Variables

1. **Create `.env` File**
   ```bash
   cd frontend
   touch .env
   ```

2. **Add Configuration**
   ```env
   REACT_APP_API_URL=http://localhost:8001/api
   ```

---

## Running the Application

### Development Mode

#### Start Backend
```bash
cd backend
npm run dev
```
Server will start on http://localhost:8001

#### Start Frontend
```bash
cd frontend
npm start
```
App will open on http://localhost:3000

### Production Mode

#### Build Frontend
```bash
cd frontend
npm run build
```

#### Start Backend
```bash
cd backend
npm start
```

---

## Production Deployment

### Deploying Backend (Render/Railway)

#### Render Deployment

1. **Create Account** at [Render.com](https://render.com)

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: aits-csms-api
     - **Region**: Choose closest to your users
     - **Branch**: main
     - **Root Directory**: backend
     - **Runtime**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Set Environment Variables**
   - Add all variables from `.env` file
   - Make sure to use production values

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy the URL (e.g., https://aits-csms-api.onrender.com)

#### Railway Deployment

1. **Create Account** at [Railway.app](https://railway.app)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service**
   - Select backend directory
   - Add environment variables
   - Deploy

### Deploying Frontend (Vercel/Netlify)

#### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

3. **Or Use Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Create React App
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`
     - **Environment Variables**: Add `REACT_APP_API_URL`

#### Netlify Deployment

1. **Create Account** at [Netlify.com](https://netlify.com)

2. **Deploy**
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub
   - Configure:
     - **Build command**: `npm run build`
     - **Publish directory**: `build`
     - **Environment variables**: Add `REACT_APP_API_URL`

### Post-Deployment

1. **Update CORS Origins**
   - Update backend `.env` with production frontend URL
   - Example: `CORS_ORIGINS="https://your-app.vercel.app"`

2. **Test Deployment**
   - Try logging in with test credentials
   - Upload a test file
   - Check all major features

---

## Testing

### Using Postman

1. **Import Collection**
   - Open Postman
   - Click "Import"
   - Select `AITS_CSMS_Postman_Collection.json` from repository root

2. **Setup Environment**
   - Click gear icon (Manage Environments)
   - Add new environment "AITS Local"
   - Add variable: `baseUrl` = `http://localhost:8001/api`

3. **Test APIs**
   - Select "AITS Local" environment
   - Run login request first
   - Token will be auto-saved
   - Test other endpoints

### Manual Testing

1. **Health Check**
   ```bash
   curl http://localhost:8001/api
   ```

2. **Test Login**
   ```bash
   curl -X POST http://localhost:8001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@aits.edu",
       "password": "admin123",
       "role": "admin"
     }'
   ```

---

## Common Issues

### Issue: MongoDB Connection Failed

**Error**: `MongoServerError: bad auth`

**Solution**:
- Verify username/password in connection string
- Check if user has correct permissions in MongoDB Atlas
- Ensure IP address is whitelisted

---

### Issue: Cannot Upload Files

**Error**: `Cloudinary upload failed`

**Solution**:
- Verify Cloudinary credentials in `.env`
- Check if cloud_name, api_key, and api_secret are correct
- Ensure file size is under 5MB
- Verify file format is allowed (JPEG, PNG, PDF)

---

### Issue: CORS Error in Browser

**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**:
- Add frontend URL to `CORS_ORIGINS` in backend `.env`
- Restart backend server after changing `.env`
- For multiple origins: `CORS_ORIGINS="http://localhost:3000,https://app.example.com"`

---

### Issue: Port Already in Use

**Error**: `EADDRINUSE: address already in use`

**Solution**:
```bash
# Find process using port 8001
lsof -i :8001

# Kill the process
kill -9 <PID>

# Or change port in .env file
PORT=8002
```

---

### Issue: JWT Token Invalid

**Error**: `Invalid token` or `Token expired`

**Solution**:
- Clear browser localStorage
- Login again to get new token
- Check if `JWT_SECRET` is set correctly
- Verify token format in Authorization header

---

### Issue: Rate Limit Exceeded

**Error**: `Too many requests`

**Solution**:
- Wait 15 minutes (for general API)
- For login: Wait 15 minutes after 5 failed attempts
- For uploads: Wait 1 hour after 20 uploads
- In development, you can temporarily disable rate limiting

---

## Database Seeding

### Create Initial Admin User

```bash
cd backend
node seed.js
```

This will create:
- 1 Super Admin
- 2 Departments
- 2 Sections
- 5 Teachers
- 20 Students

Default admin credentials:
- Email: `admin@aits.edu`
- Password: `admin123`

---

## Monitoring & Logs

### View Backend Logs

#### Development
Logs are shown in terminal where you ran `npm run dev`

#### Production (Render)
- Go to Render dashboard
- Select your service
- Click "Logs" tab

#### Production (Railway)
- Go to Railway dashboard
- Select your service
- View deployment logs

### MongoDB Logs

#### Atlas
- Go to MongoDB Atlas dashboard
- Select cluster
- Click "Metrics" or "Logs"

---

## Backup & Recovery

### Backup Database

#### MongoDB Atlas
- Go to cluster
- Click "..." → "Backup"
- Configure automatic backups

#### Local MongoDB
```bash
mongodump --db aits_csms --out ./backup
```

### Restore Database
```bash
mongorestore --db aits_csms ./backup/aits_csms
```

---

## Security Best Practices

1. **Never commit `.env` files to Git**
2. **Use strong JWT secrets (min 32 characters)**
3. **Regularly update dependencies**: `npm audit fix`
4. **Use HTTPS in production**
5. **Enable MongoDB authentication**
6. **Restrict CORS origins in production**
7. **Use environment-specific configurations**
8. **Regularly backup database**
9. **Monitor login logs for suspicious activity**
10. **Keep Cloudinary API keys secret**

---

## Getting Help

### Resources
- **Documentation**: See [README.md](./README.md) and [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Postman Collection**: Import `AITS_CSMS_Postman_Collection.json`
- **Issues**: Create issue on GitHub repository
- **MongoDB Docs**: https://docs.mongodb.com/
- **Cloudinary Docs**: https://cloudinary.com/documentation

### Support Contacts
- **Technical Issues**: Create GitHub issue
- **Security Concerns**: Email security@aits.edu
- **General Questions**: Email support@aits.edu

---

## Next Steps

After successful setup:

1. ✅ Login with admin credentials
2. ✅ Create departments and sections
3. ✅ Add teachers and assign sections
4. ✅ Add students
5. ✅ Test file uploads
6. ✅ Test certificate workflow
7. ✅ Create sample support tickets
8. ✅ Run risk detection
9. ✅ Explore analytics dashboard

---

**Last Updated**: November 2024
**Version**: 1.0.0
