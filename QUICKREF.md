# Quick Reference Card - Video Events System

## Navigation Flow

```
HOME PAGE
    ↓
EVENTS PAGE (eventList.jsx)
    ├─→ "Create Event" button (logged in)
    │       ↓
    │   CreateEventModal
    │       ↓
    │   POST /events
    │       ↓
    │   Event created & appears in list
    │
    └─→ Click event
            ↓
        EVENT GALLERY (EventGallery.jsx)
            ├─→ Event details
            ├─→ "Share Your Video" button (logged in)
            │       ↓
            │   UploadForm
            │       ↓
            │   POST /videos/add/event/{eventId}
            │       ↓
            │   Video uploaded & appears in gallery
            │
            └─→ Video grid
                    ↓
                VideoPlayer components
                    ↓
                Watch, like, view counts
```

## Component Files & Locations

| Component        | File                                         | Purpose               |
| ---------------- | -------------------------------------------- | --------------------- |
| EventList        | `client/src/pages/eventList.jsx`             | Browse all events     |
| CreateEventModal | `client/src/components/CreateEventModal.jsx` | Create new event      |
| EventGallery     | `client/src/pages/EventGallery.jsx`          | View event & videos   |
| UploadForm       | `client/src/components/uploadForm.jsx`       | Upload video to event |
| VideoPlayer      | `client/src/components/videoPlayer.jsx`      | Play video            |
| Authentication   | `client/src/store/Authentication.jsx`        | Auth context          |

## Key Features Checklist

### Event Creation ✅

- [x] Modal form with validation
- [x] Saves to database
- [x] Creates gallery automatically
- [x] Lists appear immediately

### Video Upload ✅

- [x] File validation (type, size)
- [x] Video preview
- [x] Uploads to GCP
- [x] Saves metadata
- [x] Updates storage/usage
- [x] Shows in gallery immediately

### Video Gallery ✅

- [x] Shows all event videos
- [x] Video cards with details
- [x] Click to play
- [x] Shows views and likes
- [x] Empty state with upload CTA

### Authentication ✅

- [x] JWT token in localStorage
- [x] Token included in headers
- [x] User data cached
- [x] Protected endpoints

## API Quick Reference

### Create Event

```
POST /events
Authorization: Bearer {token}
{
  "title": "Event Name",
  "description": "Description",
  "startDate": "2026-02-01T10:00:00Z",
  "endDate": "2026-02-02T18:00:00Z",
  "location": "City, Country"
}
Response: { message, event }
```

### Upload Video to Event

```
POST /videos/add/event/{eventId}
Authorization: Bearer {token}
Content-Type: multipart/form-data
{
  "video": File,
  "title": "Video Title",
  "description": "Description",
  "eventId": "{eventId}"
}
Response: { message, video }
```

### Get Event Gallery

```
GET /videos/event/{eventId}
No auth required
Response: { event, videos[], stats }
```

### Get All Events

```
GET /events
No auth required
Response: [event...]
```

## Typical User Journey

### Event Organizer

```
1. Login → Events page
2. Click "Create Event"
3. Fill form and submit
4. Share event link with participants
5. Participants upload videos
6. Organizer monitors gallery
7. Views event analytics
```

### Event Participant

```
1. Login → Events page
2. Browse available events
3. Click event to view
4. Click "Share Your Video"
5. Select video file
6. Add title/description
7. Upload video
8. Video appears in gallery
```

### Event Viewer

```
1. Go to Events page (no login needed)
2. Browse events
3. Click event title
4. See event details
5. Watch uploaded videos
6. View comments/engagement
7. Join event (if interested)
```

## Common Commands

### Development

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev

# Open browser
http://localhost:5173
```

### Build for Production

```bash
# Frontend
cd client
npm run build

# Backend
cd server
npm start
```

## File Size Reference

| Item           | Max Size   | Format                   |
| -------------- | ---------- | ------------------------ |
| Video File     | 100MB      | MP4, WebM, Ogg, MOV, AVI |
| User Storage   | 50MB       | Configurable             |
| User Bandwidth | 100MB      | Configurable             |
| Video Title    | 255 chars  | Text                     |
| Description    | 5000 chars | Text                     |

## Error Messages & Solutions

| Error                     | Cause            | Solution                     |
| ------------------------- | ---------------- | ---------------------------- |
| "Video file too large"    | >100MB           | Compress video first         |
| "Invalid file type"       | Not video format | Use MP4, WebM, Ogg, MOV, AVI |
| "Failed to upload"        | Auth issue       | Login and try again          |
| "Event not found"         | Wrong event ID   | Check URL event ID           |
| "Storage quota exceeded"  | Out of space     | Delete old videos            |
| "Authentication required" | Not logged in    | Login first                  |

## Important URLs

| URL                                | Purpose          |
| ---------------------------------- | ---------------- |
| `http://localhost:5173`            | Frontend dev     |
| `http://localhost:5000`            | Backend API      |
| `/events`                          | Events list      |
| `/events/{eventId}`                | Event gallery    |
| `POST /events`                     | Create event API |
| `POST /videos/add/event/{eventId}` | Upload video API |

## Database Models Quick Look

### Event

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  location: String,
  organizer: ObjectId,
  eventGalleryStats: { totalVideos, totalViews, totalEngagement }
}
```

### Video (in Gallery)

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  videoLink: String, // GCP URL
  size: Number,
  eventId: ObjectId,
  views: Number,
  likes: [ObjectId],
  createdAt: Date
}
```

## Testing Checklist

- [ ] Create event successfully
- [ ] Event appears in list
- [ ] Navigate to event
- [ ] See event details
- [ ] Upload video to event
- [ ] Video appears in gallery
- [ ] Can play video
- [ ] View counter works
- [ ] Like button works
- [ ] Delete video removes it
- [ ] Storage quota updates
- [ ] Event analytics accessible
- [ ] No console errors

## Contact & Support

### Documentation

- `INTEGRATION_GUIDE.md` - Complete API docs
- `FEATURE_GUIDE.md` - Feature overview
- `CHANGES.md` - What's new summary

### Debug Mode

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for API calls
5. Verify responses have data

## Quick Wins (Low-Hanging Fruit)

Next features to add:

1. Event filters (date, location)
2. Search events by title
3. User profile showing their events
4. Event sharing (social media)
5. Event notifications
6. Video comments
7. Bulk video upload
8. Custom video categories

---

**Last Updated**: Jan 30, 2026
**Version**: 1.0.0
**Ready for**: Development/Testing
