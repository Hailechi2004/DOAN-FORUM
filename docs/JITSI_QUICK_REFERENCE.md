# Jitsi Meeting Quick Reference

## 🚀 Quick Start

### Backend API Usage

```javascript
// Start a meeting
POST /meetings/:id/start
Authorization: Bearer <token>

Response:
{
  "meeting": {
    "id": 1,
    "title": "Team Meeting",
    "jitsi_room_name": "dacn-forum-meeting-1-1234567890-abc123",
    "jitsi_url": "https://meet.jit.si/dacn-forum-meeting-1-1234567890-abc123"
  },
  "jitsiUrl": "https://meet.jit.si/dacn-forum-meeting-1-1234567890-abc123",
  "roomName": "dacn-forum-meeting-1-1234567890-abc123"
}
```

```javascript
// Join a meeting
POST /meetings/:id/join
Authorization: Bearer <token>

Response:
{
  "meeting": {...},
  "jitsiUrl": "...",
  "roomName": "..."
}
```

```javascript
// End a meeting
POST /meetings/:id/end
Authorization: Bearer <token>

Response:
{
  "message": "Meeting ended successfully",
  "meeting": {...}
}
```

### Frontend Usage

```jsx
import { useDispatch } from "react-redux";
import {
  startMeeting,
  joinMeeting,
  endMeeting,
} from "../store/slices/meetingSlice";
import JitsiMeeting from "../components/JitsiMeeting";

function MyComponent() {
  const dispatch = useDispatch();
  const [openJitsi, setOpenJitsi] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  const handleStart = async (meetingId) => {
    const result = await dispatch(startMeeting(meetingId)).unwrap();
    setSessionData(result.meeting);
    setOpenJitsi(true);
  };

  const handleJoin = async (meetingId) => {
    const result = await dispatch(joinMeeting(meetingId)).unwrap();
    setSessionData(result.meeting);
    setOpenJitsi(true);
  };

  return (
    <>
      <Button onClick={() => handleStart(1)}>Start Meeting</Button>
      <Button onClick={() => handleJoin(1)}>Join Meeting</Button>

      {sessionData && (
        <JitsiMeeting
          open={openJitsi}
          onClose={() => setOpenJitsi(false)}
          roomName={sessionData.jitsi_room_name}
          meetingTitle={sessionData.title}
          meetingId={sessionData.id}
        />
      )}
    </>
  );
}
```

### Socket.io Events

```javascript
import socketService from "../services/socketService";

// Listen to events
useEffect(() => {
  socketService.on("meeting:started", (data) => {
    console.log("Meeting started:", data);
    // Refresh meetings list
  });

  socketService.on("meeting:user-joined", (data) => {
    console.log("User joined:", data);
    // Update participants count
  });

  return () => {
    socketService.off("meeting:started");
    socketService.off("meeting:user-joined");
  };
}, []);
```

## 📋 Database Queries

### Get Active Meeting Session

```sql
SELECT * FROM meeting_sessions
WHERE meeting_id = ? AND session_end IS NULL
ORDER BY session_start DESC
LIMIT 1;
```

### Get Active Participants

```sql
SELECT u.id, u.full_name, u.email, map.joined_at
FROM meeting_active_participants map
JOIN users u ON map.user_id = u.id
WHERE map.meeting_id = ? AND map.is_active = TRUE
ORDER BY map.joined_at DESC;
```

### Get Meeting Statistics

```sql
SELECT
  COUNT(DISTINCT ms.id) as total_sessions,
  COUNT(DISTINCT map.user_id) as total_participants,
  AVG(ms.duration_minutes) as avg_duration,
  SUM(ms.duration_minutes) as total_duration
FROM meeting_sessions ms
LEFT JOIN meeting_active_participants map ON ms.meeting_id = map.meeting_id
WHERE ms.meeting_id = ?;
```

## 🎨 UI Components

### Start/Join Button Pattern

```jsx
{
  meeting.jitsi_room_name ? (
    <Button
      variant="contained"
      color="secondary"
      startIcon={<VideoCallIcon />}
      onClick={() => handleJoinMeeting(meeting)}
    >
      Join Meeting
    </Button>
  ) : (
    <Button
      variant="contained"
      color="primary"
      startIcon={<VideoCallIcon />}
      onClick={() => handleStartMeeting(meeting)}
    >
      Start Meeting
    </Button>
  );
}
```

### JitsiMeeting Props Reference

```jsx
<JitsiMeeting
  // Required
  open={boolean}                    // Dialog open state
  onClose={function}                // Close handler
  roomName={string}                 // Jitsi room name
  meetingId={number}                // Meeting ID

  // Optional
  meetingTitle={string}             // Dialog title
  jitsiDomain={string}              // Default: 'meet.jit.si'
  onParticipantJoined={function}    // Callback(participant)
  onParticipantLeft={function}      // Callback(participant)
  onVideoConferenceJoined={function} // Callback()
  onVideoConferenceLeft={function}  // Callback()
  onReadyToClose={function}         // Callback()
/>
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**

```env
JITSI_DOMAIN=meet.jit.si
SOCKET_IO_PORT=3000
```

**Frontend (.env):**

```env
VITE_WS_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000/api
```

### Custom Jitsi Server

```javascript
// backend/src/services/jitsiService.js
const JITSI_DOMAIN = process.env.JITSI_DOMAIN || "jitsi.yourcompany.com";
```

## 🔐 Permission Checks

### Backend Middleware

```javascript
// Check if user can start meeting
const canStartMeeting = (user, meeting) => {
  return (
    user.role === "admin" ||
    user.id === meeting.organizer_id ||
    (user.role === "manager" && user.department_id === meeting.department_id)
  );
};

// Check if user can join meeting
const canJoinMeeting = (user, meeting) => {
  // Check if user is attendee
  const isAttendee = attendees.some(
    (a) => a.user_id === user.id && a.status === "accepted"
  );

  return (
    isAttendee ||
    user.role === "admin" ||
    user.id === meeting.organizer_id ||
    (user.role === "manager" && user.department_id === meeting.department_id)
  );
};
```

## 📊 Common Queries

### Get Meeting History

```javascript
GET /meetings/:id/sessions

Response:
{
  "sessions": [
    {
      "id": 1,
      "meeting_id": 1,
      "jitsi_room_name": "...",
      "session_start": "2024-01-15T10:00:00",
      "session_end": "2024-01-15T11:30:00",
      "duration_minutes": 90,
      "participants_count": 15,
      "started_by": {...},
      "ended_by": {...}
    }
  ]
}
```

### Get Active Participants

```javascript
GET /meetings/:id/active-participants

Response:
{
  "participants": [
    {
      "user_id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "joined_at": "2024-01-15T10:05:00"
    }
  ]
}
```

### Get Meeting Stats

```javascript
GET /meetings/:id/stats

Response:
{
  "stats": {
    "total_sessions": 3,
    "total_participants": 25,
    "avg_duration": 85.5,
    "total_duration": 256
  }
}
```

## 🐛 Common Issues & Solutions

### Issue: Jitsi not loading

```javascript
// Check browser console for errors
// Verify domain is accessible
console.log("Jitsi Domain:", sessionData.jitsi_url);

// Test domain directly
window.open(sessionData.jitsi_url, "_blank");
```

### Issue: Socket not connecting

```javascript
// Check Socket.io connection
import socketService from "../services/socketService";

useEffect(() => {
  console.log("Socket connected:", socketService.socket?.connected);
}, []);
```

### Issue: Participants not updating

```javascript
// Force refresh participants
const refreshParticipants = () => {
  if (activeMeetingSession) {
    dispatch(fetchActiveParticipants(activeMeetingSession.id));
  }
};

// Call on interval
useEffect(() => {
  const interval = setInterval(refreshParticipants, 30000); // Every 30s
  return () => clearInterval(interval);
}, [activeMeetingSession]);
```

## 📝 Testing Checklist

- [ ] Admin có thể start meeting
- [ ] Manager có thể start meeting của department mình
- [ ] User có thể join meeting sau khi được invite
- [ ] Socket.io broadcast events đúng
- [ ] Active participants được track chính xác
- [ ] Meeting sessions được lưu database
- [ ] Meeting có thể end và lưu duration
- [ ] UI hiển thị Start/Join button đúng
- [ ] JitsiMeeting dialog hoạt động
- [ ] Real-time updates qua Socket.io
- [ ] Permissions được enforce đúng
- [ ] Error handling hoạt động

## 🎯 Best Practices

1. **Always check permissions:** Verify user có quyền start/join meeting
2. **Handle Socket.io cleanup:** Unsubscribe events trong useEffect cleanup
3. **Track participants:** Log join/leave events để có audit trail
4. **Error handling:** Wrap dispatch calls trong try-catch
5. **Loading states:** Show loading indicator khi start/join meeting
6. **Close confirmation:** Hỏi user trước khi end meeting
7. **Auto-cleanup:** Clear inactive participants sau timeout
8. **Secure room names:** Sử dụng unique, random room names

## 📚 Further Reading

- [Backend Socket Handler](../backend/src/socket/socketHandler.js)
- [Frontend JitsiMeeting Component](../frontend/src/components/JitsiMeeting.jsx)
- [Meeting Slice](../frontend/src/store/slices/meetingSlice.js)
- [Full Implementation Doc](./JITSI_MEETING_IMPLEMENTATION.md)

---

**Last Updated:** 2024
**Version:** 1.0.0
