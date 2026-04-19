# Quick Deployment Reference

## ⚠️ IMPORTANT: Deploy Manually (Not Blueprint)

The monorepo structure requires manual deployment of each service.

---

## 🔧 Backend Service Configuration

**Service Type:** Web Service  
**Root Directory:** `backend`  
**Build Command:** `npm install`  
**Start Command:** `npm start`  
**Health Check:** `/api/health`

### Environment Variables:
```
NODE_ENV=production
PORT=5002
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key-here
```

---

## 🎨 Frontend Service Configuration

**Service Type:** Static Site  
**Root Directory:** `frontend`  
**Build Command:** `npm install && npm run build`  
**Publish Directory:** `dist`

### Environment Variables:
```
NODE_ENV=production
VITE_API_URL=https://your-backend-url.onrender.com
```

### Redirect Rule:
- Source: `/*`
- Destination: `/index.html`
- Action: Rewrite

---

## 📋 Deployment Checklist

### Before Deployment:
- [ ] MongoDB Atlas database created
- [ ] MongoDB network access allows 0.0.0.0/0
- [ ] JWT secret generated (use: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- [ ] Code pushed to GitHub

### Backend Deployment:
- [ ] Web Service created with correct root directory
- [ ] All environment variables set
- [ ] Health check path configured
- [ ] Service deployed successfully (green status)
- [ ] Backend URL copied for frontend

### Frontend Deployment:
- [ ] Static Site created with correct root directory
- [ ] VITE_API_URL set to backend URL
- [ ] Redirect rule configured
- [ ] Service deployed successfully (green status)

### Post-Deployment:
- [ ] Frontend loads without errors
- [ ] Can register new user
- [ ] Can login
- [ ] Can send messages
- [ ] Real-time updates work

---

## 🚨 Common Issues & Quick Fixes

### "vite: not found"
✅ Make sure Root Directory is set to `frontend`  
✅ Clear build cache and redeploy

### "Cannot connect to backend"
✅ Check VITE_API_URL is correct  
✅ Verify backend is running (green status)  
✅ Check backend logs for errors

### "MongoDB connection failed"
✅ Verify MONGODB_URI is correct  
✅ Check MongoDB Atlas network access  
✅ Ensure database user has permissions

### "502 Bad Gateway"
✅ Check backend logs  
✅ Verify PORT=5002 is set  
✅ Ensure backend is listening on 0.0.0.0

---

## 🔗 Useful Commands

### Generate JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Test Backend Health:
```bash
curl https://your-backend-url.onrender.com/api/health
```

### Check MongoDB Connection:
```bash
mongosh "your-mongodb-uri"
```

---

## 📞 Support Resources

- Render Docs: https://render.com/docs
- Render Status: https://status.render.com
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com

---

## ⏱️ Expected Deployment Times

- Backend: 5-10 minutes
- Frontend: 5-10 minutes
- Total: ~15-20 minutes

---

## 💡 Pro Tips

1. **Keep Services Active**: Use UptimeRobot to ping backend every 10 minutes
2. **Monitor Logs**: Check logs regularly for errors
3. **Use Environment Variables**: Never hardcode secrets
4. **Test Locally First**: Always test changes locally before deploying
5. **Clear Cache**: If build fails, try clearing build cache
