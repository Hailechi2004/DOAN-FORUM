# Docker Jitsi Setup - Quick Start

## 📋 Prerequisites

- Docker Desktop installed
- Docker Compose installed (comes with Docker Desktop)
- 3GB+ free disk space
- Ports available: 8000, 8443, 10000/udp, 4443

## 🚀 Quick Start (2 Minutes)

### Step 1: Start Jitsi Docker Container

Open PowerShell in project root and run:

```powershell
# Navigate to project root
cd "c:\microsoft Visual Studio Code\DACN-FORUM"

# Start Jitsi services
docker-compose -f docker-compose.jitsi.yml --env-file .env.jitsi up -d

# Check if services are running
docker-compose -f docker-compose.jitsi.yml ps
```

### Step 2: Wait for Services to be Ready

```powershell
# Check logs (wait ~30-60 seconds for all services to start)
docker-compose -f docker-compose.jitsi.yml logs -f

# Press Ctrl+C to exit logs
```

### Step 3: Update Backend .env

Already done! File `backend/.env` has been updated with:

```env
JITSI_DOMAIN=localhost:8000
JITSI_ROOM_PREFIX=dacn-forum
```

### Step 4: Start Frontend (if not running)

```powershell
# In another PowerShell window
cd frontend
npm run dev

# Frontend will be at: http://localhost:5173
```

### Step 5: Start Backend (if not running)

```powershell
# In another PowerShell window
cd backend
npm start

# Backend will be at: http://localhost:3000
```

### Step 6: Test Jitsi

1. Open browser: `http://localhost:5173/test-jitsi`
2. Click "Start Test Meeting" button
3. Should JOIN VIDEO CONFERENCE immediately (NO login required!)

---

## ✅ Verify Everything Works

### Check Jitsi Services

```powershell
# List running containers
docker ps

# Should show:
# - jitsi-web
# - jitsi-prosody
# - jitsi-jicofo
# - jitsi-jvb
```

### Test Direct Access

```
# Open browser:
http://localhost:8000/dacn-forum-test-room
```

Should load Jitsi interface directly without login prompt.

---

## 🛑 Stop Services

```powershell
# Stop all Jitsi services
docker-compose -f docker-compose.jitsi.yml down

# Stop and remove volumes (clean reset)
docker-compose -f docker-compose.jitsi.yml down -v
```

---

## 🔧 Troubleshooting

### Issue: "Connection refused" or "Cannot connect to Jitsi"

**Solution:**

```powershell
# Check if containers are running
docker-compose -f docker-compose.jitsi.yml ps

# If not running, start them
docker-compose -f docker-compose.jitsi.yml up -d

# Check logs for errors
docker-compose -f docker-compose.jitsi.yml logs web jicofo jvb
```

### Issue: Ports already in use

**Solution:**

```powershell
# Check what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or use different ports in docker-compose.jitsi.yml
# Change: ports: ['8001:80', '8444:443']
```

### Issue: Still asking for login

**Solution:**

```powershell
# Make sure backend .env has:
# JITSI_DOMAIN=localhost:8000

# Restart backend
cd backend
npm start

# Clear browser cache:
# Ctrl+Shift+Delete in Chrome/Firefox
```

### Issue: Video/Audio not working

**Solution:**

```powershell
# Check browser permissions for camera/microphone
# Chrome: Settings > Privacy and security > Camera/Microphone > Allow

# Test on test page:
http://localhost:5173/test-jitsi

# Check browser console for errors (F12)
```

---

## 📊 Monitor Services

```powershell
# Real-time logs
docker-compose -f docker-compose.jitsi.yml logs -f

# Specific service logs
docker-compose -f docker-compose.jitsi.yml logs -f web
docker-compose -f docker-compose.jitsi.yml logs -f jicofo
docker-compose -f docker-compose.jitsi.yml logs -f jvb
```

---

## 🎯 Integration with DACN-FORUM

### Admin Panel

1. Go to: `http://localhost:5173/admin/meetings`
2. Login as Admin
3. Click purple "VideoCall" button on any meeting
4. Should open Jitsi meeting directly (NO lobby!)

### Manager Panel

1. Go to: `http://localhost:5173/manager/meetings`
2. Login as Manager
3. Click "Start Meeting" or "Join Meeting" button
4. Should connect to Jitsi immediately

### Employee Access

1. Go to: `http://localhost:5173`
2. View assigned meetings
3. Click "Join" to connect to Jitsi meeting

---

## 🔄 Docker Commands Reference

```powershell
# Start services
docker-compose -f docker-compose.jitsi.yml up -d

# Stop services
docker-compose -f docker-compose.jitsi.yml down

# Restart services
docker-compose -f docker-compose.jitsi.yml restart

# View logs
docker-compose -f docker-compose.jitsi.yml logs -f

# Remove all data (clean reset)
docker-compose -f docker-compose.jitsi.yml down -v

# Rebuild images
docker-compose -f docker-compose.jitsi.yml build --no-cache

# Execute command in container
docker-compose -f docker-compose.jitsi.yml exec web bash
```

---

## 💡 Next Steps

After successful test:

1. ✅ Verify meetings join without login
2. ✅ Test audio/video
3. ✅ Test screen share
4. ✅ Test multiple participants (open in 2 browser tabs)
5. ✅ Check real-time participant updates
6. ✅ Test add/edit/delete meeting flows

---

## 📝 Production Deployment

When ready for production:

1. **Self-host Jitsi** on Ubuntu server
2. **Configure SSL** with Let's Encrypt
3. **Setup proper authentication** if needed
4. Update `backend/.env`:
   ```env
   JITSI_DOMAIN=your-jitsi-domain.com
   ```

For details, see: `JITSI_SETUP_SOLUTIONS.md`

---

## 🆘 Need Help?

If issues persist:

1. Check Docker is running: `docker --version`
2. Check docker-compose: `docker-compose --version`
3. View detailed logs: `docker-compose -f docker-compose.jitsi.yml logs`
4. Check network connectivity: `docker network ls`

Good luck! 🚀
