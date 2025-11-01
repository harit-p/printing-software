# 🚀 Complete Render Deployment Guide

## Overview
Deploy your full-stack printing software (Backend + Frontend) on Render in 3 main steps.

---

## 📋 Prerequisites
- ✅ Render account ([render.com](https://render.com))
- ✅ GitHub account with code pushed
- ✅ 15-20 minutes

---

## 🗄️ PART 1: Deploy Database

### Step 1: Create PostgreSQL Database
1. **Login to Render** → Click **"New +"** → **"PostgreSQL"**
2. **Fill in details:**
   ```
   Name: printing-software-db
   Database: printing_software
   User: postgres
   Region: Oregon (US West) or nearest
   PostgreSQL Version: 15
   Datadog API Key: [Leave empty]
   Plan: Free
   ```
3. Click **"Create Database"**
4. **Wait 2-3 minutes** for database to be ready
5. **Save the connection details** (you'll need them later)

---

## ⚙️ PART 2: Deploy Backend

### Step 2: Create Backend Web Service
1. **Render Dashboard** → **"New +"** → **"Web Service"**
2. **Connect Repository:**
   - Click **"Connect account"** if not connected
   - Select your repository: `printing-software`
   - Click **"Connect"**

3. **Configure Service:**
   ```
   Name: printing-software-backend
   Region: Same as database (Oregon)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Select Plan:**
   - Choose **"Free"** plan
   - Click **"Advanced"**

5. **Add Health Check:**
   ```
   Health Check Path: /health
   ```

### Step 3: Add Environment Variables
Scroll down to **"Environment Variables"** section and add these one by one:

**Click "Add Environment Variable" for each:**

| Key | Value | How to Get |
|-----|-------|------------|
| `NODE_ENV` | `production` | Type manually |
| `PORT` | `10000` | Type manually |
| `DB_HOST` | `[Your DB Host]` | Copy from database "Internal Database URL" |
| `DB_PORT` | `5432` | Type manually |
| `DB_NAME` | `printing_software` | Same as database name |
| `DB_USER` | `[Your DB User]` | Copy from database connection info |
| `DB_PASSWORD` | `[Your DB Password]` | Copy from database connection info |
| `JWT_SECRET` | `printing-jwt-secret-2024-secure-key-abc123` | Type manually |
| `JWT_REFRESH_SECRET` | `printing-refresh-secret-2024-secure-key-xyz789` | Type manually |

**How to get database connection details:**
1. Go to your `printing-software-db` database
2. Click on **"Info"** tab
3. Look for **"Internal Database URL"** - it looks like:
   ```
   postgresql://user:password@host:5432/database
   ```
4. Extract the values:
   - **DB_HOST**: The part after `@` and before `:5432` (e.g., `dpg-xxxxx-a.oregon-postgres.render.com`)
   - **DB_USER**: The part after `postgresql://` and before `:` (e.g., `printing_software_user`)
   - **DB_PASSWORD**: The part after first `:` and before `@`
   - **DB_NAME**: The part after last `/` (e.g., `printing_software`)

**Alternative: Use DATABASE_URL (Simpler)**
Instead of individual variables, you can use just one:
- **Key**: `DATABASE_URL`
- **Value**: Copy the entire "Internal Database URL" from your database

Then update your `backend/config/database.js` to use `DATABASE_URL` if present.

### Step 5: Deploy Backend
1. Click **"Create Web Service"**
2. **Wait 3-5 minutes** for deployment
3. Watch the logs for:
   - ✅ "Database connected successfully"
   - ✅ "Server running on port 10000"

### Step 6: Test Backend
Your backend URL will be: `https://printing-software-backend.onrender.com`

Test it:
```bash
# Test health check
curl https://printing-software-backend.onrender.com/health

# Should return:
# {"status":"OK","timestamp":"...","uptime":...}
```

---

## 🎨 PART 3: Deploy Frontend

### Step 7: Create Frontend Static Site
1. **Render Dashboard** → **"New +"** → **"Static Site"**
2. **Connect Repository:**
   - Select your repository: `printing-software`
   - Click **"Connect"**

3. **Configure Site:**
   ```
   Name: printing-software-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm run build
   Publish Directory: out
   ```

### Step 8: Add Frontend Environment Variables
Click **"Add Environment Variable"**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | `https://printing-software-backend.onrender.com` |

**⚠️ Important:** Replace `printing-software-backend` with your actual backend service name from Step 2.

### Step 9: Deploy Frontend
1. Click **"Create Static Site"**
2. **Wait 3-5 minutes** for build and deployment
3. Watch build logs for success

### Step 10: Test Frontend
Your frontend URL will be: `https://printing-software-frontend.onrender.com`

Open it in your browser and test:
- ✅ Homepage loads
- ✅ Can navigate to login/register
- ✅ Can view products

---

## 🔧 PART 4: Post-Deployment Setup

### Step 11: Run Database Migrations
1. Go to your **backend service** on Render
2. Click **"Shell"** tab (or use SSH)
3. Run these commands:
   ```bash
   cd /opt/render/project/src
   npm run migrate
   ```

### Step 12: Create Admin User
In the same shell:
```bash
npm run create-admin
```
Follow the prompts to create your admin account.

### Step 13: (Optional) Seed Sample Data
```bash
npm run seed
```

---

## ✅ Verification Checklist

### Backend Checks:
- [ ] Database service shows "Available"
- [ ] Backend service shows "Live"
- [ ] Health check returns 200 OK
- [ ] Can access: `/api/products`
- [ ] Can access: `/api/categories`

### Frontend Checks:
- [ ] Static site shows "Live"
- [ ] Homepage loads correctly
- [ ] Can register new user
- [ ] Can login as customer
- [ ] Can login as admin
- [ ] Products display correctly

---

## 🌐 Your Deployed URLs

After deployment, your app will be available at:

**Backend API:**
```
https://printing-software-backend.onrender.com
```

**Frontend Website:**
```
https://printing-software-frontend.onrender.com
```

**Database:**
```
Internal connection (not publicly accessible)
```

---

## 🚨 Troubleshooting

### Issue: Backend Build Fails
**Solution:**
- Check build logs for errors
- Ensure `package.json` has `start` script
- Verify all dependencies are listed

### Issue: Database Connection Error
**Solution:**
- Reconnect database: Backend Service → Connect → Postgres
- Check environment variables are set
- Ensure database is "Available"

### Issue: Frontend Can't Connect to Backend
**Solution:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend CORS allows frontend URL
- Test backend health endpoint first

### Issue: 502 Bad Gateway
**Solution:**
- Backend might be sleeping (free tier)
- Wait 30 seconds for it to wake up
- Check backend logs for errors

### Issue: Health Check Fails
**Solution:**
- Ensure `/health` endpoint exists
- Check `PORT=10000` in environment
- Verify server starts successfully

---

## 💡 Important Notes

### Free Tier Limitations:
- **Backend**: Sleeps after 15 min inactivity, takes ~30s to wake up
- **Database**: Free for 90 days, then $7/month
- **Frontend**: Always active, no sleep
- **Build minutes**: 500 minutes/month free

### Performance Tips:
- First request may be slow (backend waking up)
- Keep backend active by pinging health endpoint
- Consider upgrading to paid plan for production

### Security:
- ✅ HTTPS enabled automatically
- ✅ Environment variables encrypted
- ✅ Database connection secured
- ✅ CORS configured properly

---

## 🔄 Updating Your App

### To Deploy Updates:
1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update description"
   git push origin main
   ```
3. Render auto-deploys (if enabled)
4. Or manually: Service → Manual Deploy → Deploy

---

## 📞 Support Resources

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Render Status**: [status.render.com](https://status.render.com)
- **Community**: [community.render.com](https://community.render.com)
- **Support**: support@render.com

---

## 🎉 Success!

If all steps completed successfully:
- ✅ Your database is running
- ✅ Your backend API is live
- ✅ Your frontend is deployed
- ✅ Users can access your app

**Your printing software is now live on the internet!** 🚀

Share your frontend URL with users:
```
https://printing-software-frontend.onrender.com
```

---

## 📝 Quick Reference

### Environment Variables Summary

**Backend:**
```
NODE_ENV=production
PORT=10000
JWT_SECRET=printing-jwt-secret-2024-secure-key-abc123
JWT_REFRESH_SECRET=printing-refresh-secret-2024-secure-key-xyz789
[Database variables auto-filled]
```

**Frontend:**
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://printing-software-backend.onrender.com
```

### Common Commands
```bash
# View logs
render logs printing-software-backend

# Restart service
render restart printing-software-backend

# SSH into service
render ssh printing-software-backend

# Run migrations
npm run migrate

# Create admin
npm run create-admin
```

---

**Need help?** Check the troubleshooting section above or contact Render support.
