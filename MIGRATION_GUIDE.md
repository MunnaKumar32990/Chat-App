# Migration Guide

If you were working with the old project structure, this guide will help you migrate to the new organized structure.

## 🔄 What Changed

### Directory Changes

| Old Path | New Path | Status |
|----------|----------|--------|
| `client/` | `frontend/` | ✅ Renamed |
| `server/` | `backend/` | ✅ Renamed |
| `server/src/` | Removed | ❌ Duplicate structure |
| Root test files | Removed | ❌ Moved to backend |

### File Changes

| Old File | New File | Action |
|----------|----------|--------|
| `start.bat` | `start-dev.bat` | ✅ Improved |
| `SETUP_GUIDE.md` | `QUICK_START.md` | ✅ Enhanced |
| `server/middleware/authMiddleware.js` | `backend/middleware/auth.js` | ✅ Consolidated |
| `test-mongo.js` (root) | Removed | ❌ Not needed |
| `test-auth.js` (root) | Removed | ❌ Not needed |

## 📝 Update Your Workflow

### 1. Update Git Remote (if applicable)

```bash
# Pull latest changes
git pull origin main

# If you have local changes, stash them first
git stash
git pull origin main
git stash pop
```

### 2. Reinstall Dependencies

```bash
# Remove old node_modules
rm -rf node_modules
rm -rf client/node_modules
rm -rf server/node_modules

# Install with new structure
npm run install:all
```

### 3. Update Environment Variables

**Old:** `server/.env`
**New:** `backend/.env`

```bash
# Copy your old .env file
cp server/.env backend/.env

# Or create new from template
cd backend
cp .env.example .env
# Edit with your values
```

### 4. Update Import Paths (if you modified code)

**Backend imports remain the same** - no changes needed

**Frontend imports remain the same** - no changes needed

### 5. Update Scripts

**Old commands:**
```bash
cd server && npm start
cd client && npm run dev
```

**New commands:**
```bash
# From root
npm run dev:backend
npm run dev:frontend

# Or start both
npm run dev

# Or use script
start-dev.bat
```

## 🔧 IDE Configuration Updates

### VS Code

Update `.vscode/settings.json` if you have one:

```json
{
  "search.exclude": {
    "**/node_modules": true,
    "**/backend/node_modules": true,
    "**/frontend/node_modules": true,
    "**/backend/uploads": true
  },
  "files.exclude": {
    "**/node_modules": true
  }
}
```

### ESLint

No changes needed - configurations are in respective directories.

### Prettier

No changes needed - works with new structure.

## 📦 Package.json Changes

### Root package.json

**New scripts available:**
```json
{
  "scripts": {
    "install:all": "Install both frontend and backend",
    "dev": "Start both servers concurrently",
    "dev:backend": "Start backend only",
    "dev:frontend": "Start frontend only",
    "build": "Build frontend for production",
    "start": "Start backend in production"
  }
}
```

### Backend package.json

Location changed: `server/package.json` → `backend/package.json`

No script changes needed.

### Frontend package.json

Location changed: `client/package.json` → `frontend/package.json`

No script changes needed.

## 🗂️ File Locations Reference

### Backend Files

| Component | Old Location | New Location |
|-----------|-------------|--------------|
| Main server | `server/index.js` | `backend/index.js` |
| Controllers | `server/controllers/` | `backend/controllers/` |
| Models | `server/models/` | `backend/models/` |
| Routes | `server/routes/` | `backend/routes/` |
| Middleware | `server/middleware/` | `backend/middleware/` |
| Utils | `server/utils/` | `backend/utils/` |
| Uploads | `server/uploads/` | `backend/uploads/` |
| Environment | `server/.env` | `backend/.env` |

### Frontend Files

| Component | Old Location | New Location |
|-----------|-------------|--------------|
| Source | `client/src/` | `frontend/src/` |
| Public | `client/public/` | `frontend/public/` |
| Components | `client/src/components/` | `frontend/src/components/` |
| Pages | `client/src/pages/` | `frontend/src/pages/` |
| Stores | `client/src/store/` | `frontend/src/store/` |
| Config | `client/vite.config.js` | `frontend/vite.config.js` |

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot find module"

**Problem:** Import paths broken after migration

**Solution:**
```bash
# Clear node_modules and reinstall
npm run install:all
```

### Issue 2: "Port already in use"

**Problem:** Old server still running

**Solution:**
```bash
# Windows
netstat -ano | findstr :5002
taskkill /PID <process_id> /F

# Then restart
npm run dev
```

### Issue 3: "Environment variables not found"

**Problem:** .env file in wrong location

**Solution:**
```bash
# Ensure .env is in backend/ directory
ls backend/.env

# If not, copy from template
cd backend
cp .env.example .env
```

### Issue 4: "MongoDB connection failed"

**Problem:** Connection string not updated

**Solution:**
```bash
# Edit backend/.env
# Update MONGODB_URI with your connection string
```

### Issue 5: "Frontend can't connect to backend"

**Problem:** Proxy configuration

**Solution:**
- Check `frontend/vite.config.js` proxy settings
- Ensure backend is running on port 5002
- Clear browser cache

## ✅ Verification Steps

After migration, verify everything works:

```bash
# 1. Check dependencies installed
ls backend/node_modules
ls frontend/node_modules

# 2. Check environment configured
cat backend/.env

# 3. Start backend
cd backend
npm run dev
# Should see: "Server running on port 5002"

# 4. Start frontend (new terminal)
cd frontend
npm run dev
# Should see: "Local: http://localhost:5173"

# 5. Test application
# Open http://localhost:5173
# Register/login
# Send a message
```

## 📋 Migration Checklist

- [ ] Pulled latest code
- [ ] Removed old node_modules
- [ ] Installed dependencies with `npm run install:all`
- [ ] Copied/created `backend/.env`
- [ ] Updated environment variables
- [ ] Tested backend starts successfully
- [ ] Tested frontend starts successfully
- [ ] Verified can register/login
- [ ] Verified can send messages
- [ ] Updated IDE configuration (if needed)
- [ ] Updated deployment scripts (if any)

## 🎯 Benefits of New Structure

1. **Cleaner Organization**
   - Clear separation of concerns
   - No duplicate files
   - Industry-standard structure

2. **Better Development Experience**
   - Simple startup scripts
   - Clear documentation
   - Easy to navigate

3. **Production Ready**
   - Proper environment handling
   - Security improvements
   - Deployment configuration

4. **Scalability**
   - Easy to add features
   - Modular architecture
   - Independent deployment possible

## 📚 Additional Resources

- [QUICK_START.md](./QUICK_START.md) - Setup guide
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Architecture details
- [README.md](./README.md) - Full documentation
- [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md) - Deployment guide

## 🆘 Need Help?

If you encounter issues during migration:

1. Check this guide for common issues
2. Review the QUICK_START.md guide
3. Verify environment variables
4. Check console logs for errors
5. Ensure MongoDB is running
6. Clear browser cache and cookies

## ✨ Summary

The migration is straightforward:
1. Pull latest code
2. Reinstall dependencies
3. Update environment file location
4. Use new startup scripts

All functionality remains the same - just better organized!

**Migration Status: ✅ Complete**
