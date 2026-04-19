# Render Deployment Guide

## Overview
This guide will help you deploy the chat application to Render with the updated configuration.

## Prerequisites
- GitHub repository with your code
- Render account (free tier works)
- MongoDB Atlas database (or other MongoDB hosting)

## Configuration Files Updated

### 1. render.yaml
The `render.yaml` file now uses `rootDir` to specify which directory each service should use:
- **Backend**: Uses `backend/` directory
- **Frontend**: Uses `frontend/` directory

### 2. package.json
Updated build scripts to ensure proper installation before building.

## Deployment Steps

### Option 1: Deploy via render.yaml (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Update deployment configuration"
   git push origin main
   ```

2. **Create New Blueprint on Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository containing your chat app
   - Render will automatically detect `render.yaml`
   - Click "Apply"

3. **Set Environment Variables**
   After deployment starts, you'll need to set these in the Render dashboard:
   
   **For Backend Service:**
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: production (already set)
   - `PORT`: 5002 (already set)
   
   **For Frontend Service:**
   - `VITE_API_URL`: Your backend URL (e.g., https://chat-app-backend.onrender.com)
   - `NODE_ENV`: production (already set)

### Option 2: Manual Deployment

If the Blueprint approach doesn't work, deploy each service manually:

#### Backend Service

1. **Create New Web Service**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your repository
   - Configure:
     - **Name**: chat-app-backend
     - **Root Directory**: `backend`
     - **Environment**: Node
     - **Region**: Ohio (or your preferred region)
     - **Branch**: main
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

2. **Add Environment Variables**
   - `NODE_ENV`: production
   - `PORT`: 5002
   - `MONGODB_URI`: [Your MongoDB URI]
   - `JWT_SECRET`: [Your JWT Secret]

3. **Add Health Check**
   - Path: `/api/health`

#### Frontend Service

1. **Create New Static Site**
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your repository
   - Configure:
     - **Name**: chat-app-frontend
     - **Root Directory**: `frontend`
     - **Branch**: main
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`

2. **Add Environment Variables**
   - `NODE_ENV`: production
   - `VITE_API_URL`: [Your backend URL from step 1]

3. **Configure Redirects/Rewrites**
   Add this to handle client-side routing:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: Rewrite

## Troubleshooting

### Issue: "vite: not found"

**Solution 1: Clear Build Cache**
- Go to your service settings
- Click "Manual Deploy" → "Clear build cache & deploy"

**Solution 2: Verify package.json**
Ensure `frontend/package.json` has vite in devDependencies:
```json
"devDependencies": {
  "vite": "^4.4.5"
}
```

**Solution 3: Use explicit npx**
Update `frontend/package.json` build script:
```json
"scripts": {
  "build": "npx vite build"
}
```

### Issue: Build fails with "Cannot find module"

**Solution**: Ensure `rootDir` is set correctly in render.yaml or manual configuration.

### Issue: Frontend can't connect to backend

**Solution**: 
1. Check `VITE_API_URL` environment variable in frontend service
2. Ensure backend service is running and accessible
3. Check CORS settings in backend
4. Verify the backend URL is correct (should be the Render URL, not localhost)

### Issue: MongoDB connection fails

**Solution**:
1. Verify `MONGODB_URI` is set correctly
2. Check MongoDB Atlas network access (allow 0.0.0.0/0 for Render)
3. Ensure MongoDB user has proper permissions

### Issue: 502 Bad Gateway

**Solution**:
1. Check backend logs for errors
2. Verify `PORT` environment variable is set to 5002
3. Ensure backend is listening on `0.0.0.0` not `localhost`

## Environment Variables Reference

### Backend (.env)
```env
NODE_ENV=production
PORT=5002
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-jwt-key-here
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

## Post-Deployment Checklist

- [ ] Backend service is running (green status)
- [ ] Frontend static site is deployed (green status)
- [ ] Can access frontend URL
- [ ] Can register a new user
- [ ] Can login
- [ ] Can send messages
- [ ] Real-time updates work (Socket.IO)
- [ ] File uploads work (if applicable)

## Monitoring

### View Logs
- Go to your service in Render dashboard
- Click "Logs" tab
- Monitor for errors or issues

### Check Service Health
- Backend: Visit `https://your-backend-url.onrender.com/api/health`
- Should return: `{"status":"ok"}`

## Free Tier Limitations

Render's free tier has these limitations:
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month of runtime
- Limited bandwidth

**Tip**: Keep services active by using a service like UptimeRobot to ping your backend every 10 minutes.

## Upgrading to Paid Plan

For production use, consider upgrading to:
- **Starter Plan** ($7/month per service)
  - No spin-down
  - Faster builds
  - More resources

## Alternative: Single Service Deployment

If you prefer to deploy as a single service (backend serves frontend):

1. Update `backend/index.js` to serve static files:
```javascript
// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}
```

2. Update build command:
```bash
npm run build:frontend && npm run install:backend
```

3. Deploy as single Node service

## Support

If you encounter issues:
1. Check Render's status page: https://status.render.com
2. Review Render documentation: https://render.com/docs
3. Check application logs in Render dashboard
4. Verify all environment variables are set correctly

## Security Notes

- Never commit `.env` files to Git
- Use Render's environment variable management
- Rotate JWT secrets regularly
- Keep dependencies updated
- Enable HTTPS (automatic on Render)
- Set proper CORS origins in production
