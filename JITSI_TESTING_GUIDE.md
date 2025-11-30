# 🎥 Hướng Dẫn Test Jitsi Meeting

## 🚀 Quick Test

### Option 1: Test Page (Không cần login)

```
URL: http://localhost:5173/test-jitsi
```

Click "Start Test Meeting" để test ngay Jitsi video conferencing.

### Option 2: Admin Meetings Page (Cần login)

```
1. Login với tài khoản Admin
2. Navigate: http://localhost:5173/admin/meetings
3. Tìm meeting bất kỳ
4. Click nút VideoCall (màu tím) để Start/Join meeting
```

### Option 3: Manager Meetings Page (Cần login)

```
1. Login với tài khoản Manager
2. Navigate: http://localhost:5173/manager/meetings
3. Click nút VideoCall (màu tím) trên meeting của department
```

## 🎯 Features Đã Implement

### ✅ Backend

- [x] Jitsi Service (generate room, create link)
- [x] Meeting API endpoints (start, join, end)
- [x] Socket.io real-time events
- [x] Database tables (sessions, participants, events)

### ✅ Frontend

- [x] JitsiMeeting component với full features
- [x] Redux actions (startMeeting, joinMeeting, endMeeting)
- [x] Admin Meetings UI với Start/Join buttons
- [x] Manager Meetings UI với Start/Join buttons
- [x] Socket.io listeners cho real-time updates
- [x] Test page cho quick testing

## 🔍 Cách Test

### 1. Test Basic Functionality

**URL:** `http://localhost:5173/test-jitsi`

**Steps:**

1. Click "Start Test Meeting"
2. Allow camera/microphone permissions
3. Verify video appears
4. Test các features:
   - ✅ Video on/off
   - ✅ Audio mute/unmute
   - ✅ Screen sharing
   - ✅ Chat
   - ✅ Participant list
   - ✅ Leave meeting

### 2. Test Admin Meetings Integration

**URL:** `http://localhost:5173/admin/meetings`

**Steps:**

1. Login as Admin
2. Tìm 1 meeting trong danh sách
3. Click nút **VideoCallIcon** (màu tím #9c27b0)
4. Verify:
   - ✅ Dialog mở với Jitsi interface
   - ✅ Meeting title hiển thị đúng
   - ✅ Video conference starts
   - ✅ Close dialog khi end meeting

### 3. Test Real-time Updates

**Steps:**

1. Mở 2 browser tabs
2. Tab 1: Admin start meeting
3. Tab 2: Verify meeting list updates (Socket.io)
4. Tab 2: Join meeting
5. Tab 1: Verify participant count updates

### 4. Test Permissions

**Scenarios:**

- ✅ Admin có thể start bất kỳ meeting nào
- ✅ Manager chỉ start meetings của department mình
- ✅ User chỉ join meetings được invite
- ✅ Organizer có thể end meeting

## 🎨 UI Elements

### Start/Join Meeting Button

```
Location: Cột Actions trong Meeting table
Icon: VideoCallIcon (màu tím #9c27b0)
States:
  - "Start Video Meeting" - Nếu chưa có jitsi_room_name
  - "Join Video Meeting" - Nếu đã started
```

### Jitsi Dialog

```
Type: Full-screen Material-UI Dialog
Features:
  - Meeting title in header
  - Jitsi iframe embedded
  - Close button
  - Event callbacks
```

## 🐛 Common Issues & Solutions

### Issue 1: "Camera/Mic not found"

**Solution:** Allow browser permissions for camera/microphone

### Issue 2: "Jitsi not loading"

**Check:**

- Internet connection (cần access meet.jit.si)
- Browser console for errors
- HTTPS nếu production

### Issue 3: "Socket.io not updating"

**Check:**

- Backend đang chạy (port 3000)
- Socket connection trong browser console
- VITE_WS_URL trong .env

### Issue 4: "Button không hiển thị"

**Check:**

- User có permissions (admin/manager/organizer)
- Meeting không bị cancelled

## 📊 Database Check

### Verify Tables Created

```sql
SHOW TABLES LIKE 'meeting%';

-- Should return:
-- meeting_sessions
-- meeting_active_participants
-- meeting_events
```

### Check Meeting Data

```sql
-- Xem meetings
SELECT id, title, jitsi_room_name, created_at
FROM meetings
ORDER BY created_at DESC
LIMIT 10;

-- Xem sessions
SELECT * FROM meeting_sessions
ORDER BY session_start DESC
LIMIT 5;
```

## 🎯 Next Steps

### Test Checklist

- [ ] Open test page và start meeting thành công
- [ ] Login Admin và thấy Start button
- [ ] Click Start và Jitsi dialog mở
- [ ] Video/audio hoạt động
- [ ] Screen sharing hoạt động
- [ ] Close dialog và meeting end
- [ ] Check database có record session
- [ ] Test Socket.io real-time updates
- [ ] Test Manager permissions
- [ ] Test với multiple participants

### Production Deployment

Khi deploy production:

1. Update `JITSI_DOMAIN` nếu dùng self-hosted Jitsi
2. Ensure HTTPS (Jitsi yêu cầu HTTPS)
3. Configure Socket.io với production URL
4. Test permissions thoroughly
5. Monitor database performance

## 📞 Support

Nếu cần hỗ trợ:

1. Check browser console logs
2. Check backend server logs
3. Verify Socket.io connection
4. Check database records
5. Review documentation: `/docs/JITSI_MEETING_IMPLEMENTATION.md`

---

**Test URL:** http://localhost:5173/test-jitsi
**Admin URL:** http://localhost:5173/admin/meetings
**Manager URL:** http://localhost:5173/manager/meetings
