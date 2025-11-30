# 🎥 Jitsi Meeting - Hướng Dẫn Sử Dụng Nhanh

## ✅ Đã Fix Các Lỗi

### 1. Socket.io Connection
- ✅ Auto-connect khi vào trang Meetings
- ✅ Tự động reconnect nếu mất kết nối
- ✅ Hiển thị status trong console

### 2. Permission Check
- ✅ Admin có thể start bất kỳ meeting nào
- ✅ Manager có thể start meetings của department
- ✅ Organizer có thể start meetings của mình
- ✅ Support cả định dạng role cũ và mới

### 3. UI/UX Improvements
- ✅ Tooltip hiển thị "Start" hoặc "Join" 
- ✅ Badge "LIVE" cho meeting đang chạy
- ✅ Animation pulse cho meeting active
- ✅ Hover effect trên buttons
- ✅ Alert trong form hướng dẫn Jitsi

## 📝 Cách Tạo & Sử Dụng Meeting

### 1️⃣ Tạo Meeting Mới

**Admin:**
```
1. Vào: Admin → Meetings
2. Click nút "Add Meeting"
3. Điền thông tin:
   ✅ Title: Tên cuộc họp
   ✅ Description: Mô tả
   ✅ Department(s): Chọn phòng ban
   ✅ Start/End Time: Thời gian
   ✅ Location: Địa điểm (optional)
   ✅ Meeting Link: Link external (optional - Google Meet, Zoom)
   ✅ Attendees: Chọn người tham gia
4. Click "Create"
```

**Manager:**
```
1. Vào: Manager → Meetings  
2. Click "Add Meeting"
3. Điền thông tin (tương tự Admin)
   ⚠️ Meeting tự động thuộc department của bạn
4. Click "Create"
```

### 2️⃣ Start Jitsi Video Meeting

**Sau khi tạo meeting:**
```
1. Tìm meeting trong danh sách
2. Tìm nút VideoCall màu TÍM (🎥) trong cột Actions
3. Hover để xem tooltip: "Start Jitsi Video Conference"
4. Click vào nút
5. Dialog Jitsi sẽ mở → Cho phép camera/mic
6. Video conference bắt đầu! 🎉
```

**Visual:**
```
Meeting Table Row:
┌─────────────────────────────────────────────────────┐
│ Title │ Dept │ Time │ Attendees │ 👁️ 👥 🎥 ✏️ ❌ 🗑️│
│                                        ↑             │
│                                    NÚT TÍM          │
│                              (Start Video Meeting)  │
└─────────────────────────────────────────────────────┘
```

### 3️⃣ Join Meeting Đang Chạy

**Khi meeting đã started:**
```
1. Nút VideoCall sẽ có badge "LIVE" màu đỏ
2. Icon sẽ nhấp nháy (pulse animation)
3. Hover tooltip: "Join Jitsi Video Meeting"
4. Click để join ngay
```

**Visual:**
```
┌────────────────┐
│    🎥 [LIVE]   │  ← Badge đỏ + pulse animation
└────────────────┘
```

### 4️⃣ Sử Dụng Jitsi Features

**Trong Dialog Jitsi:**
```
┌─────────────────────────────────────────┐
│ 📹 Meeting Title               [X]      │
├─────────────────────────────────────────┤
│                                         │
│     [Your Video Preview]                │
│                                         │
│  ┌────┬────┬────┬────┬────┬────┐      │
│  │ 🎤 │ 📹 │ 🖥️ │ 💬 │ 👥 │ ⚙️ │      │
│  └────┴────┴────┴────┴────┴────┘      │
│   Mic  Cam Screen Chat People Settings │
└─────────────────────────────────────────┘

Features:
✅ Mute/Unmute microphone
✅ Turn camera on/off
✅ Share screen
✅ Chat with participants
✅ View participant list
✅ Change display name
✅ Raise hand
✅ Reactions (emoji)
✅ Recording (nếu enabled)
```

### 5️⃣ End Meeting

**Cách 1: Đóng Dialog**
```
- Click nút X trên dialog
- Hoặc click outside dialog
- Bạn sẽ leave meeting
```

**Cách 2: Leave từ Jitsi**
```
- Click nút Leave/Hangup trong Jitsi
- Dialog tự động đóng
```

**Cách 3: End cho tất cả (Admin/Organizer)**
```
- Click End Meeting trong Jitsi
- Hoặc gọi API end meeting
- Tất cả participants sẽ bị kick out
```

## 🎨 Giao Diện Mới

### Alert trong Form Create/Edit
```
┌────────────────────────────────────────────────┐
│ ℹ️ 🎥 Jitsi Video Conferencing                │
│                                                │
│ After creating the meeting, you can start a   │
│ Jitsi video conference by clicking the purple │
│ 🎥 button in the meeting list.                │
│ No additional setup required!                 │
└────────────────────────────────────────────────┘
```

### Button States

**Start State (Chưa start):**
```
🎥  ← Màu tím #9c27b0
    Hover: Scale 1.1x + background color
    Tooltip: "Start Jitsi Video Conference"
```

**Live State (Đang chạy):**
```
🎥 [LIVE]  ← Badge đỏ + pulse animation
           Tooltip: "Join Jitsi Video Meeting"
```

## 🔧 Features Hoạt Động

### ✅ Real-time Updates
- Socket.io tự động connect
- Khi ai đó start meeting → List refresh
- Khi user join → Participant count update
- Khi meeting end → Status update

### ✅ Permissions
- **Admin:** Start bất kỳ meeting nào
- **Manager:** Start meetings của department
- **Organizer:** Start meetings mình tạo
- **Attendee:** Join meetings được invite

### ✅ Database Tracking
- Mỗi session được lưu vào `meeting_sessions`
- Track participants trong `meeting_active_participants`
- Log events vào `meeting_events`

### ✅ Multi-participant Support
- Nhiều người join cùng lúc
- Xem danh sách participants
- Track join/leave time
- Calculate duration

## 🐛 Troubleshooting

### Lỗi: "Socket not connected"
**Fix:** Refresh trang, socket sẽ auto-connect

### Lỗi: "Only organizer can start meeting"
**Check:** 
- Bạn có phải organizer?
- Hoặc admin?
- Hoặc manager của department đó?

### Lỗi: "Camera/Mic not found"
**Fix:** 
- Allow browser permissions
- Check physical devices
- Try different browser

### Lỗi: "Jitsi not loading"
**Check:**
- Internet connection
- Access to meet.jit.si
- Browser console errors

## 📊 Test Checklist

- [ ] Tạo meeting mới thành công
- [ ] Thấy Alert hướng dẫn Jitsi trong form
- [ ] Thấy nút 🎥 màu tím trong meeting list
- [ ] Hover thấy tooltip "Start Video Conference"
- [ ] Click start → Dialog Jitsi mở
- [ ] Camera/mic hoạt động
- [ ] Thấy badge "LIVE" khi meeting started
- [ ] User khác có thể join
- [ ] Real-time updates qua Socket.io
- [ ] End meeting thành công
- [ ] Database lưu session history

## 🚀 Next Steps

Sau khi test:
1. Test với multiple users cùng lúc
2. Test permissions (admin/manager/organizer)
3. Test screen sharing
4. Test chat feature
5. Check database records
6. Monitor Socket.io logs
7. Test trên mobile/tablet

---

**URLs:**
- Admin: http://localhost:5173/admin/meetings
- Manager: http://localhost:5173/manager/meetings
- Test: http://localhost:5173/test-jitsi

**Màu Jitsi Button:** `#9c27b0` (Purple)
**Badge Live:** Red with pulse animation
