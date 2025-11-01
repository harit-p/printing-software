# 🔧 Backend Render Setup - Detailed Guide

## 📋 Step-by-Step Backend Deployment

### **Step 1: Create PostgreSQL Database**

1. **Login to Render Dashboard**
2. Click **"New"** → **"PostgreSQL"**
3. **Database Configuration:**
   ```
   Name: printing-software-db
   Database Name: printing_software
   User: postgres
   Version: PostgreSQL 15
   Region: [Choose nearest to you]
   Plan: Free (for development)
   ```
4. Click **"Create Database"**

### **Step 2: Create Backend Web Service**

1. **Go to Dashboard** → **"New"** → **"Web Service"**
2. **Connect Repository:**
   - Select your GitHub repository
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Region**: Same as your database

3. **Build Settings:**
   ```
   Build Command: npm install
   Start Command: npm start
   Health Check Path: /health
   ```

4. **Advanced Settings:**
   - **Auto-Deploy**: ✅ Enabled (push to main branch triggers deploy)
   - **Instance Type**: Free (for development)

### **Step 3: Configure Environment Variables**

#### **Database Connection (Auto-filled):**
1. In your service settings → **"Connect"** → **"Postgres"**
2. Select your `printing-software-db`
3. Render will auto-add these variables:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`

#### **Manual Variables:**
Add these manually in **Environment** section:

| Key | Value | Type |
|-----|-------|------|
| `NODE_ENV` | `production` | Plain Text |
| `PORT` | `10000` | Plain Text |
| `JWT_SECRET` | `printing-software-jwt-2024-abc123def456` | Plain Text |
| `JWT_REFRESH_SECRET` | `printing-software-refresh-2024-xyz987wvu654` | Plain Text |

### **Step 4: Deploy and Test**

1. **Click "Create Web Service"**
2. **Wait for deployment** (2-5 minutes)
3. **Check deployment logs** for any errors
4. **Test health endpoint:**
   ```
   https://printing-software-backend.onrender.com/health
   ```
   Should return:
   ```json
   {
     "status": "OK",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "uptime": 123.456
   }
   ```

---

## 🚨 Common Issues & Solutions

### **Issue 1: Build Fails**
**Symptoms:**
- Build error in logs
- Service shows "Failed" status

**Solutions:**
1. **Check package.json:**
   - Ensure `start` script exists: `"start": "node server.js"`
   - All dependencies listed correctly

2. **Check Node.js version:**
   - Add `engines` to package.json:
     ```json
     "engines": {
       "node": ">=14.0.0"
     }
     ```

3. **Verify file structure:**
   - `server.js` must exist in root directory
   - All route files must exist

### **Issue 2: Database Connection Error**
**Symptoms:**
- Error: "Database connection error"
- Service crashes after starting

**Solutions:**
1. **Check database variables:**
   - Go to service → Environment
   - Verify all `DB_*` variables are present
   - Test connection manually in Render dashboard

2. **Reconnect database:**
   - Service → Connect → Postgres → Reconnect
   - This refreshes connection variables

3. **Check database status:**
   - Ensure database service is running
   - Try connecting from Render dashboard

### **Issue 3: Health Check Fails**
**Symptoms:**
- Service shows "Live" but health check fails
- 504 Gateway Timeout

**Solutions:**
1. **Verify health endpoint:**
   - Check `/health` route exists in server.js
   - Ensure it returns JSON with status 200

2. **Check CORS:**
   - Ensure Render frontend URL is in CORS whitelist
   - Update server.js CORS if needed

3. **Check port:**
   - Ensure `PORT=10000` in environment
   - Don't use 5000 (that's for local dev)

### **Issue 4: CORS Errors**
**Symptoms:**
- Frontend can't connect to backend
- Browser console shows CORS errors

**Solutions:**
1. **Update CORS configuration:**
   - Add Render frontend URL to CORS origins
   - Ensure both middleware and cors() allow it

2. **Check environment:**
   - `NODE_ENV=production` affects CORS
   - Test with exact frontend URL

---

## 🔍 Debugging Steps

### **1. Check Deployment Logs**
```
Service → Logs → Real-time
```
Look for:
- ✅ Database connection success
- ✅ Server started on port 10000
- ❌ Any error messages

### **2. Test API Endpoints**
```bash
# Health check
curl https://printing-software-backend.onrender.com/health

# Test auth endpoint
curl https://printing-software-backend.onrender.com/api/auth/me

# Test products endpoint
curl https://printing-software-backend.onrender.com/api/products
```

### **3. Check Environment Variables**
```
Service → Environment → Edit
```
Verify all variables are set correctly.

### **4. Restart Service**
```
Service → Manual Deploy → Trigger Deploy
```
This restarts with latest configuration.

---

## 📝 Complete Environment Variables List

### **Required Variables:**
```bash
NODE_ENV=production
PORT=10000
DB_HOST=auto-filled-by-render
DB_PORT=auto-filled-by-render
DB_NAME=printing_software
DB_USER=postgres
DB_PASSWORD=auto-filled-by-render
JWT_SECRET=printing-software-jwt-2024-abc123def456
JWT_REFRESH_SECRET=printing-software-refresh-2024-xyz987wvu654
```

### **Optional Variables:**
```bash
# For debugging
DEBUG=printing-software:*

# For uploads (if needed)
UPLOAD_PATH=/opt/render/project/backend/uploads
```

---

## 🚀 Post-Deployment Setup

### **1. Run Database Migrations**
```bash
# SSH into your service (Render provides this)
cd /opt/render/project/backend
npm run migrate
```

### **2. Create Admin User**
```bash
npm run create-admin
```

### **3. Seed Data (Optional)**
```bash
npm run seed
```

---

## 📞 Getting Help

### **Render Resources:**
- **Documentation**: render.com/docs
- **Status**: status.render.com
- **Support**: support@render.com

### **Common Debug Commands:**
```bash
# Check Node.js version
node --version

# Check if dependencies installed
ls node_modules/

# Test database connection
node -e "require('./config/database').connect()"

# Start server manually
node server.js
```

---

## ✅ Success Checklist

- [ ] PostgreSQL database created and running
- [ ] Backend web service created
- [ ] All environment variables set
- [ ] Health check endpoint working
- [ ] Database connection successful
- [ ] API endpoints responding
- [ ] CORS configured for frontend
- [ ] Database migrations run
- [ ] Admin user created

If all items are checked, your backend is ready! 🎉
