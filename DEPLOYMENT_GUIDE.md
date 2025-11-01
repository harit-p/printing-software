# 🚀 Render Deployment Guide

## Overview
This guide will help you deploy your full-stack printing software application on Render.com.

## 📋 Prerequisites
- Render account (sign up at [render.com](https://render.com))
- GitHub account with your code pushed
- Active internet connection

---

## 🗄️ Step 1: Deploy Backend

### 1.1 Create Database
1. Go to Render Dashboard → **New** → **PostgreSQL**
2. **Configuration**:
   - **Name**: `printing-software-db`
   - **Database Name**: `printing_software`
   - **User**: `postgres`
   - **Region**: Choose nearest to your users
   - **Plan**: Free tier (for development)

### 1.2 Deploy Backend Service
1. Go to Render Dashboard → **New** → **Web Service**
2. **Connect Repository**: Select your GitHub repository
3. **Configuration**:
   - **Name**: `printing-software-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`

### 1.3 Environment Variables
Add these environment variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DB_HOST` | (Auto-filled from database) |
| `DB_PORT` | (Auto-filled from database) |
| `DB_NAME` | (Auto-filled from database) |
| `DB_USER` | (Auto-filled from database) |
| `DB_PASSWORD` | (Auto-filled from database) |
| `JWT_SECRET` | (Generate automatically) |
| `JWT_REFRESH_SECRET` | (Generate automatically) |

### 1.4 Connect Database
1. In the service settings, click **"Connect"** → **"Postgres"**
2. Select your `printing-software-db` database
3. Render will auto-configure the database connection variables

---

## 🎨 Step 2: Deploy Frontend

### 2.1 Create Frontend Service
1. Go to Render Dashboard → **New** → **Web Service**
2. **Connect Repository**: Select your GitHub repository
3. **Configuration**:
   - **Name**: `printing-software-frontend`
   - **Root Directory**: `frontend`
   - **Environment**: `Static Site`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `out`

### 2.2 Environment Variables
Add these environment variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | `https://printing-software-backend.onrender.com` |

### 2.3 Custom Routes (Optional)
Add custom routes to handle API calls:

```yaml
routes:
  - type: rewrite
    source: /api/(.*)
    destination: https://printing-software-backend.onrender.com/api/$1
  - type: file
    source: /**
    destination: /index.html
```

---

## 🔧 Step 3: Database Setup

### 3.1 Run Migrations
Once your backend is deployed, you need to set up the database:

1. **SSH into your backend service** (Render provides this option)
2. **Run migration script**:
   ```bash
   cd /opt/render/project/backend
   npm run migrate
   ```

### 3.2 Create Admin User
```bash
npm run create-admin
```

### 3.3 Seed Data (Optional)
```bash
npm run seed
```

---

## 🌐 Step 4: Update CORS Configuration

Your backend is already configured to accept requests from your frontend. The deployed URLs will be:
- **Backend**: `https://printing-software-backend.onrender.com`
- **Frontend**: `https://printing-software-frontend.onrender.com`

---

## ✅ Step 5: Test Your Deployment

### 5.1 Check Backend Health
Visit: `https://printing-software-backend.onrender.com/health`

You should see:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### 5.2 Test API Endpoints
- `GET /api/auth/me` - Test authentication
- `GET /api/products` - Test product listing
- `GET /api/categories` - Test categories

### 5.3 Test Frontend
Visit: `https://printing-software-frontend.onrender.com`

Test:
- User registration/login
- Product browsing
- Admin dashboard (if you created admin user)

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
- **Check**: Database service is running
- **Check**: Environment variables are correctly set
- **Solution**: Reconnect database in service settings

#### 2. Build Failures
- **Check**: All dependencies are in package.json
- **Check**: Build command works locally
- **Solution**: Check build logs in Render dashboard

#### 3. CORS Errors
- **Check**: Frontend URL is in backend CORS whitelist
- **Solution**: Update CORS configuration in server.js

#### 4. 502 Bad Gateway
- **Check**: Backend service is running
- **Check**: Health check endpoint is working
- **Solution**: Check service logs

### Useful Commands

#### Check Service Logs
```bash
# In Render dashboard, go to your service → Logs
# Or use Render CLI
render logs printing-software-backend
```

#### Restart Service
```bash
render restart printing-software-backend
```

#### Redeploy
```bash
# Push new commit to GitHub to trigger redeploy
git add .
git commit -m "Update for deployment"
git push origin main
```

---

## 📊 Monitoring

### Render Dashboard Features
- **Metrics**: CPU, Memory, Response times
- **Logs**: Real-time and historical logs
- **Alerts**: Set up email notifications
- **Custom Domains**: Add your own domain (paid plans)

### Free Tier Limitations
- **Backend**: 750 hours/month (sleeps after 15 min inactivity)
- **Database**: 90 days free, then $7/month
- **Frontend**: Always active static site

---

## 🔄 CI/CD Pipeline

Render automatically creates a CI/CD pipeline:
1. **Push to GitHub** → Auto-deploys
2. **Pull Requests** → Preview deployments
3. **Environment variables** → Secure configuration
4. **Health checks** → Automatic monitoring

---

## 🎉 Next Steps

1. **Custom Domain**: Add your domain (paid plan)
2. **SSL Certificate**: Auto-provided by Render
3. **Monitoring**: Set up alerts and monitoring
4. **Backup**: Regular database backups
5. **Scaling**: Upgrade plans as needed

---

## 💡 Tips

- **Use environment variables** for all configuration
- **Keep build times short** by optimizing dependencies
- **Monitor logs** regularly for issues
- **Test locally** before deploying
- **Use feature branches** for development

---

## 📞 Support

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Community**: [render.com/community](https://render.com/community)
- **Support**: support@render.com

Happy deploying! 🚀
