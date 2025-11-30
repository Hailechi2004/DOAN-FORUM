# Jitsi Meet Video Conferencing Implementation

## 📋 Tổng Quan

Tích hợp Jitsi Meet video conferencing vào DACN-FORUM project, cho phép Admin và Manager tổ chức và tham gia các cuộc họp trực tuyến.

## 🏗️ Kiến Trúc

### Backend Components

#### 1. Jitsi Service (`backend/src/services/jitsiService.js`)

**Mục đích:** Core service xử lý logic Jitsi Meet

**Chức năng chính:**

- `generateRoomName(meetingId)`: Tạo room name unique theo format `dacn-forum-meeting-{id}-{timestamp}-{random}`
- `createMeetingLink(meetingId)`: Tạo full Jitsi URL
- `validateRoomAccess(roomName, userId)`: Kiểm tra quyền truy cập meeting room
- `getJitsiConfig()`: Lấy cấu hình Jitsi domain

**Environment Variables:**

```env
JITSI_DOMAIN=meet.jit.si  # Có thể thay đổi sang self-hosted Jitsi server
```

#### 2. Meeting Model Extensions (`backend/src/models/Meeting.js`)

**Các method mới:**

- `startMeeting(id, jitsiLink, roomName, startedBy)`: Start meeting session
- `endMeeting(id, endedBy)`: End meeting session
- `trackJoin(meetingId, userId)`: Track user join vào meeting
- `trackLeave(meetingId, userId)`: Track user leave meeting
- `getActiveParticipants(meetingId)`: Lấy danh sách participants đang active
- `getMeetingSessions(meetingId)`: Lấy lịch sử sessions
- `getMeetingStats(meetingId)`: Lấy thống kê meeting
- `logMeetingEvent(meetingId, userId, eventType, eventData)`: Log events
- `getMeetingEvents(meetingId)`: Lấy event logs

#### 3. Meeting Controller (`backend/src/presentation/controllers/meetingController.js`)

**API Endpoints mới:**

- `POST /meetings/:id/start`: Start Jitsi meeting
  - Authorization: Organizer hoặc Manager
  - Response: `{ meeting, jitsiUrl, roomName }`
- `POST /meetings/:id/join`: Join Jitsi meeting
  - Authorization: Attendee hoặc có quyền
  - Response: `{ meeting, jitsiUrl, roomName }`
- `POST /meetings/:id/end`: End Jitsi meeting
  - Authorization: Organizer hoặc Manager
  - Response: `{ message, meeting }`
- `GET /meetings/:id/active-participants`: Lấy participants đang active
- `GET /meetings/:id/sessions`: Lấy lịch sử sessions
- `GET /meetings/:id/stats`: Lấy thống kê meeting
- `GET /meetings/:id/events`: Lấy event logs

#### 4. Socket.io Events (`backend/src/socket/socketHandler.js`)

**Meeting Events:**

- `meeting:join-room`: User request join meeting room
- `meeting:leave-room`: User request leave meeting room
- `meeting:user-joined`: Broadcast user joined
- `meeting:user-left`: Broadcast user left
- `meeting:screen-share-started`: Screen sharing started
- `meeting:screen-share-stopped`: Screen sharing stopped
- `meeting:recording-started`: Recording started
- `meeting:recording-stopped`: Recording stopped
- `meeting:started`: Meeting session started
- `meeting:ended`: Meeting session ended

**Broadcast Methods:**

- `broadcastMeetingStarted(meetingId, meetingData)`: Notify meeting started
- `broadcastMeetingEnded(meetingId)`: Notify meeting ended
- `notifyMeetingAttendees(meetingId, event, data)`: Notify specific attendees
- `broadcastToMeeting(meetingId, event, data)`: Broadcast to meeting room

### Database Schema

#### 1. `meeting_sessions` Table

```sql
CREATE TABLE meeting_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  meeting_id INT NOT NULL,
  jitsi_room_name VARCHAR(255),
  session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
  session_end DATETIME NULL,
  started_by INT NULL,  -- Changed from NOT NULL to NULL
  ended_by INT NULL,
  participants_count INT DEFAULT 0,
  duration_minutes INT NULL,
  recording_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (started_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (ended_by) REFERENCES users(id) ON DELETE SET NULL
)
```

**Mục đích:** Track lịch sử các sessions của meeting

#### 2. `meeting_active_participants` Table

```sql
CREATE TABLE meeting_active_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  meeting_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_meeting_user (meeting_id, user_id)
)
```

**Mục đích:** Track real-time participants trong meeting

#### 3. `meeting_events` Table

```sql
CREATE TABLE meeting_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  meeting_id INT NOT NULL,
  user_id INT,
  event_type ENUM('join', 'leave', 'screen_share', 'recording', 'chat', 'other'),
  event_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_meeting_events (meeting_id, created_at)
)
```

**Mục đích:** Audit log cho meeting events

### Frontend Components

#### 1. JitsiMeeting Component (`frontend/src/components/JitsiMeeting.jsx`)

**Props:**

- `open`: Boolean - Dialog open state
- `onClose`: Function - Close handler
- `roomName`: String - Jitsi room name
- `meetingTitle`: String - Meeting title
- `meetingId`: Number - Meeting ID
- `jitsiDomain`: String - Jitsi server domain (default: meet.jit.si)
- `onParticipantJoined`: Function - Callback when participant joins
- `onParticipantLeft`: Function - Callback when participant leaves
- `onVideoConferenceJoined`: Function - Callback when user joins conference
- `onVideoConferenceLeft`: Function - Callback when user leaves conference
- `onReadyToClose`: Function - Callback when ready to close

**Features:**

- Full-screen Material-UI Dialog
- Jitsi Meet iframe integration
- Event listeners (participantJoined, participantLeft, videoConferenceJoined, etc.)
- Custom configuration (toolbar, filmstrip, etc.)

#### 2. Redux Store (`frontend/src/store/slices/meetingSlice.js`)

**New State:**

```javascript
{
  jitsiData: {
    roomName: null,
    jitsiUrl: null,
    jitsiDomain: null,
  },
  activeParticipants: [],
  sessions: [],
  stats: null,
  jitsiConfig: null,
}
```

**New Actions:**

- `startMeeting(meetingId)`: Start Jitsi meeting
- `joinMeeting(meetingId)`: Join Jitsi meeting
- `endMeeting(meetingId)`: End Jitsi meeting
- `fetchActiveParticipants(meetingId)`: Fetch active participants
- `fetchMeetingSessions(meetingId)`: Fetch session history
- `fetchMeetingStats(meetingId)`: Fetch meeting statistics
- `fetchJitsiConfig()`: Fetch Jitsi configuration

#### 3. Admin Meetings Page (`frontend/src/pages/admin/Meetings.jsx`)

**Updates:**

- Import `JitsiMeeting` component
- Import meeting actions từ `meetingSlice`
- Import `socketService`
- Added states: `openJitsiDialog`, `activeMeetingSession`
- Added handlers:
  - `handleStartMeeting(meeting)`: Start video meeting
  - `handleJoinMeeting(meeting)`: Join existing meeting
  - `handleEndMeeting()`: End meeting session
  - `handleCloseJitsiDialog()`: Close Jitsi dialog
  - `handleParticipantJoined(participant)`: Handle participant joined
  - `handleParticipantLeft(participant)`: Handle participant left
- Socket.io listeners:
  - `meeting:started`: Refresh meetings list
  - `meeting:ended`: Refresh meetings list and close dialog
  - `meeting:user-joined`: Update active participants
  - `meeting:user-left`: Update active participants
- UI Changes:
  - Added Start/Join Meeting button (purple VideoCallIcon)
  - Shows "Join" button nếu meeting đã có `jitsi_room_name`
  - Shows "Start" button nếu chưa start
  - Added JitsiMeeting Dialog

#### 4. Manager Meetings Page (`frontend/src/pages/manager/Meetings.jsx`)

**Updates:** (Similar to Admin page)

- Same Jitsi integration pattern
- Department-scoped permissions
- Same UI components
- Same Socket.io listeners

## 🚀 Quy Trình Sử Dụng

### 1. Admin/Manager Start Meeting

```
1. Admin/Manager click "Start Meeting" button (purple VideoCallIcon)
2. Frontend gọi dispatch(startMeeting(meetingId))
3. Backend:
   - Tạo Jitsi room name unique
   - Tạo Jitsi URL
   - Lưu vào meeting_sessions table
   - Broadcast "meeting:started" via Socket.io
4. Frontend mở JitsiMeeting Dialog
5. User tham gia Jitsi conference
```

### 2. User Join Meeting

```
1. User click "Join Meeting" button
2. Frontend gọi dispatch(joinMeeting(meetingId))
3. Backend:
   - Validate quyền truy cập
   - Track join vào meeting_active_participants
   - Log event vào meeting_events
   - Broadcast "meeting:user-joined" via Socket.io
4. Frontend mở JitsiMeeting Dialog
5. User tham gia Jitsi conference
```

### 3. User Leave Meeting

```
1. User đóng JitsiMeeting Dialog
2. Jitsi triggers videoConferenceLeft event
3. Frontend gọi handleCloseJitsiDialog()
4. Backend track leave (nếu gọi API)
5. Broadcast "meeting:user-left"
```

### 4. End Meeting

```
1. Organizer/Manager click End Meeting (hoặc đóng dialog)
2. Frontend gọi dispatch(endMeeting(meetingId))
3. Backend:
   - Update session_end time
   - Calculate duration
   - Set all active participants to inactive
   - Broadcast "meeting:ended"
4. All participants' dialogs close automatically
```

## 📊 Real-time Updates

### Socket.io Flow

```
Browser A (Organizer)                Backend                   Browser B (Participant)
      |                                 |                              |
      |-- startMeeting(id) ----------->|                              |
      |<-------- success --------------|                              |
      |                                 |-- "meeting:started" -------->|
      |                                 |                              |
      |                                 |<-- joinMeeting(id) ----------|
      |<-- "meeting:user-joined" -------|-- "meeting:user-joined" --->|
      |                                 |                              |
```

### Event Listeners

Cả Admin và Manager Meetings pages đều subscribe:

- `meeting:started`: Refresh danh sách meetings
- `meeting:ended`: Refresh và đóng dialog nếu đang trong meeting đó
- `meeting:user-joined`: Update active participants count
- `meeting:user-left`: Update active participants count

## 🔧 Configuration

### Backend Environment Variables

```env
# Jitsi Configuration
JITSI_DOMAIN=meet.jit.si
# Hoặc self-hosted: JITSI_DOMAIN=jitsi.yourcompany.com

# Socket.io
SOCKET_IO_PORT=3000
```

### Frontend Environment Variables

```env
# WebSocket URL
VITE_WS_URL=http://localhost:3000

# Jitsi Domain (optional, backend sẽ provide)
VITE_JITSI_DOMAIN=meet.jit.si
```

## 🎨 UI Components

### Start/Join Meeting Button

```jsx
{
  meeting.jitsi_room_name ? (
    <IconButton
      size="small"
      onClick={() => handleJoinMeeting(meeting)}
      sx={{ color: "#9c27b0" }}
      title="Join Video Meeting"
    >
      <VideoCallIcon fontSize="small" />
    </IconButton>
  ) : (
    <IconButton
      size="small"
      onClick={() => handleStartMeeting(meeting)}
      sx={{ color: "#9c27b0" }}
      title="Start Video Meeting"
    >
      <VideoCallIcon fontSize="small" />
    </IconButton>
  );
}
```

### JitsiMeeting Dialog

```jsx
<JitsiMeeting
  open={openJitsiDialog}
  onClose={handleCloseJitsiDialog}
  roomName={activeMeetingSession.jitsi_room_name}
  meetingTitle={activeMeetingSession.title}
  meetingId={activeMeetingSession.id}
  jitsiDomain={activeMeetingSession.jitsi_url?.split("/")[2] || "meet.jit.si"}
  onParticipantJoined={handleParticipantJoined}
  onParticipantLeft={handleParticipantLeft}
/>
```

## 📈 Thống Kê & Reports

### Available Statistics

- Total sessions per meeting
- Total participants
- Average duration
- Recording URLs (if enabled)
- Event logs (join/leave/screen share/recording)

### API Endpoints

- `GET /meetings/:id/sessions`: Session history
- `GET /meetings/:id/stats`: Statistics summary
- `GET /meetings/:id/events`: Event logs
- `GET /meetings/:id/active-participants`: Current participants

## 🔐 Permissions

### Start Meeting

- Admin: Có thể start bất kỳ meeting nào
- Manager: Có thể start meetings của department mình
- Organizer: Có thể start meetings mình tạo

### Join Meeting

- Attendees (accepted)
- Organizer
- Manager của department
- Admin

### End Meeting

- Organizer
- Manager của department
- Admin

## 🐛 Troubleshooting

### Common Issues

1. **Meeting không start được:**

   - Check JITSI_DOMAIN environment variable
   - Check backend logs cho errors
   - Verify user permissions

2. **Socket.io không connect:**

   - Check VITE_WS_URL trong frontend
   - Verify backend Socket.io đang chạy
   - Check browser console cho connection errors

3. **Jitsi video không load:**

   - Check Jitsi domain accessibility
   - Verify HTTPS nếu production
   - Check browser permissions (camera/mic)

4. **Participants không update real-time:**
   - Verify Socket.io connection
   - Check event listeners trong useEffect
   - Check backend broadcast methods

## 📝 Migration

### Running Migration

```bash
cd backend
node database/migrate-meeting-sessions.js
```

### Migration Output

```
✅ Meeting sessions tables created successfully!
Tables created:
- meeting_sessions (0 rows)
- meeting_active_participants (0 rows)
- meeting_events (0 rows)
```

## 🎯 Next Steps (Optional Enhancements)

1. **Recording Integration:**

   - Integrate Jibri for server-side recording
   - Store recording URLs in meeting_sessions
   - Add playback UI

2. **Screen Sharing Tracking:**

   - Log screen share events
   - Track who shared screen and duration

3. **Chat History:**

   - Save Jitsi chat messages
   - Display chat history in meeting details

4. **Meeting Analytics:**

   - Participant engagement metrics
   - Meeting quality ratings
   - Attendance reports

5. **Calendar Integration:**

   - Auto-start meetings at scheduled time
   - Send reminders with Jitsi links
   - Sync with Google Calendar

6. **Mobile Support:**
   - Use Jitsi Mobile SDK
   - Responsive UI for tablets

## 📚 Documentation References

- [Jitsi Meet API Documentation](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe)
- [Jitsi React SDK](https://github.com/jitsi/jitsi-meet-react-sdk)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Material-UI Dialog](https://mui.com/material-ui/react-dialog/)

---

**Implementation Date:** 2024
**Status:** ✅ Completed
**Version:** 1.0.0
