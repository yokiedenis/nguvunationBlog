# Event Video Solution - Quick Reference Guide

## Files Modified/Created

| File                             | Type       | Changes                                                                            |
| -------------------------------- | ---------- | ---------------------------------------------------------------------------------- |
| `server/models/GallerySchema.js` | Modified   | Enhanced video schema with metadata (eventId, creator, category, visibility, etc.) |
| `server/models/EventSchema.js`   | Modified   | Added event gallery management, stats, and video upload settings                   |
| `server/routers/videos.js`       | Replaced   | Consolidated videos.js + video.js into single comprehensive router                 |
| `server/routers/video.js`        | Deprecated | Functionality merged into videos.js                                                |
| `server/server.js`               | Modified   | Added Event model import + event video event handlers                              |
| `EVENT_VIDEO_SOLUTION.md`        | Created    | Complete API documentation and solution guide                                      |

---

## Core Concepts

### 1. **Dual Gallery System**

```
User Gallery (Personal)
├── User's own videos
├── Storage per user (50MB free)
├── Bandwidth per user (100MB daily)
└── Original logic preserved

Event Gallery (Shared)
├── Videos linked to specific event
├── Respects visibility rules
├── Event-wide engagement tracking
└── Organizer analytics
```

### 2. **Visibility Control**

```
PUBLIC       → Visible to everyone
PRIVATE      → Only uploader can see
MEMBERSONLY  → Only event participants can see
```

### 3. **Video Categories**

```
fundraiser          → Fundraising footage
performance         → Live performances
testimonial         → User testimonials
behind-the-scenes   → Behind-the-scenes content
announcement        → Event announcements
other              → General content
```

### 4. **Upload Permissions**

```
ORGANIZER     → Only event organizer can upload
PARTICIPANTS  → Organizer + participants can upload
ALL          → Anyone can upload
```

---

## Endpoint Map

### User Videos

```
POST   /videos/add/:userId              Upload to personal gallery
GET    /videos/me                       Get my gallery
GET    /videos/user/:userId             Get public user gallery
DELETE /videos/:videoId                 Delete my video
```

### Event Videos

```
GET    /videos/event/:eventId           Get event gallery
GET    /videos/event/:eventId/videos    Get event videos (filtered)
POST   /videos/add/event/:eventId       Upload to event
DELETE /videos/event/:eventId/:videoId  Delete from event
```

### Engagement

```
POST   /videos/:videoId/view            Record view
POST   /videos/:videoId/like            Like/unlike video
```

### Analytics

```
GET    /videos/event/:eventId/analytics Event analytics (organizer only)
GET    /videos/me/stats                 User statistics
```

---

## Common Tasks

### Upload Video to Event

```bash
curl -X POST http://localhost:5000/videos/add/event/EVENT_ID \
  -H "Authorization: Bearer TOKEN" \
  -F "video=@video.mp4" \
  -F "title=My Video" \
  -F "category=fundraiser" \
  -F "visibility=public"
```

### Get Event Videos (Sorted by Views)

```bash
curl "http://localhost:5000/videos/event/EVENT_ID/videos?sort=views"
```

### Filter by Category

```bash
curl "http://localhost:5000/videos/event/EVENT_ID/videos?category=testimonial"
```

### Get Analytics

```bash
curl http://localhost:5000/videos/event/EVENT_ID/analytics \
  -H "Authorization: Bearer ORGANIZER_TOKEN"
```

### Like a Video

```bash
curl -X POST http://localhost:5000/videos/VIDEO_ID/like \
  -H "Authorization: Bearer TOKEN"
```

---

## Database Schema Summary

### Video Object

```javascript
{
  title: String,
  description: String,
  size: Number,
  videoLink: String,
  publicId: String,
  eventId: ObjectId | null,        // NEW
  videoCreator: ObjectId,           // NEW
  category: String,                 // NEW
  visibility: String,               // NEW
  thumbnail: String,                // NEW
  duration: Number,
  views: Number,                    // NEW
  likes: [ObjectId],               // NEW
  createdAt: Date,
  updatedAt: Date
}
```

### Gallery.eventGalleries

```javascript
[
  {
    eventId: ObjectId,
    totalVideos: Number,
    totalEngagement: {
      views: Number,
      likes: Number,
    },
    createdAt: Date,
  },
];
```

### Event.eventGalleryStats

```javascript
{
  totalVideos: Number,
  totalViews: Number,
  totalEngagement: Number
}
```

---

## Event Handlers

### When Video Uploaded to Event

**Event Type:** `eventVideoAdded`

```json
{
  "userId": "user123",
  "eventId": "event123",
  "video": {
    /* full video object */
  },
  "gallery": { "freeStorage": 44757520, "freeBandwidth": 94757520 }
}
```

**Updates:** Storage, bandwidth, event stats, usage records

### When Video Removed from Event

**Event Type:** `eventVideoRemoved`

```json
{
  "userId": "user123",
  "eventId": "event123",
  "videoId": "video123",
  "videoSize": 25165824
}
```

**Updates:** Storage (restored), bandwidth (restored), event stats

---

## Permission Matrix

| Action                        | User | Organizer | Participant | Guest |
| ----------------------------- | ---- | --------- | ----------- | ----- |
| Upload (personal)             | ✅   | ✅        | ✅          | ❌    |
| Upload (organizer restrict)   | ❌   | ✅        | ❌          | ❌    |
| Upload (participant restrict) | ❌   | ✅        | ✅          | ❌    |
| View public                   | ✅   | ✅        | ✅          | ✅    |
| View private (own)            | ✅   | ❌        | ❌          | ❌    |
| View membersOnly              | ✅   | ✅        | ✅          | ❌    |
| Delete own                    | ✅   | ✅        | ✅          | ❌    |
| Delete others                 | ❌   | ✅\*      | ❌          | ❌    |
| View analytics                | ❌   | ✅        | ❌          | ❌    |

\*Organizer can delete any video in their event

---

## Response Patterns

### Success (Single Video)

```json
{
  "message": "Success message",
  "video": {
    /* video object */
  }
}
```

### Success (Multiple Videos)

```json
{
  "eventId": "event123",
  "videos": [
    /* array of videos */
  ],
  "pagination": { "total": 10 }
}
```

### Success (Event Gallery)

```json
{
  "event": {
    /* event object */
  },
  "videos": [
    /* array of videos */
  ],
  "stats": {
    "totalVideos": 10,
    "totalViews": 1250,
    "totalLikes": 350
  }
}
```

### Error

```json
{
  "message": "Error description"
}
```

---

## Key Features Summary

✅ **User Galleries**

- Personal video storage
- Storage/bandwidth quotas
- Original logic preserved
- Public/private visibility

✅ **Event Galleries**

- Event-linked videos
- Visibility controls (public/private/membersOnly)
- Upload permission restrictions
- Event-wide analytics

✅ **Engagement**

- View tracking (automatic increment)
- Like system (user-driven)
- Engagement metrics
- Real-time updates

✅ **Analytics**

- Per-event dashboard
- Video performance metrics
- Engagement statistics
- Top videos ranking

✅ **Security**

- JWT authentication
- Permission enforcement
- Visibility-based access
- Organizer controls

---

## Testing Workflow

1. **Create Event**

   ```bash
   POST /events with title, dates, location
   ```

2. **Upload Event Video**

   ```bash
   POST /videos/add/event/{eventId} with video file
   ```

3. **View Event Gallery**

   ```bash
   GET /videos/event/{eventId}
   ```

4. **Engage with Video**

   ```bash
   POST /videos/{videoId}/view
   POST /videos/{videoId}/like (authenticated)
   ```

5. **Check Analytics**

   ```bash
   GET /videos/event/{eventId}/analytics (organizer only)
   ```

6. **Manage Videos**
   ```bash
   DELETE /videos/event/{eventId}/{videoId}
   ```

---

## Troubleshooting

| Issue                           | Solution                                               |
| ------------------------------- | ------------------------------------------------------ |
| "Authorization token missing"   | Add `Authorization: Bearer TOKEN` header               |
| "Only event organizer..."       | Check if user is event organizer                       |
| "Only event participants..."    | Join the event first or check restrictions             |
| "Video not found"               | Verify videoId and permissions                         |
| "Insufficient storage space"    | Check freeStorage, delete old videos, or upgrade quota |
| "Exceeds daily bandwidth limit" | Wait for quota reset or upgrade plan                   |
| Video not appearing in gallery  | Check visibility settings and user permissions         |
| Event analytics not updating    | Verify user is organizer, check server logs            |

---

## Quick Links

- **Full Documentation:** `EVENT_VIDEO_SOLUTION.md`
- **Videos Router:** `server/routers/videos.js`
- **Gallery Model:** `server/models/GallerySchema.js`
- **Event Model:** `server/models/EventSchema.js`
- **Server Config:** `server/server.js`

---

## Notes

- Original video upload logic fully preserved
- GCP storage integration unchanged
- All endpoints follow existing patterns
- Event handlers maintain consistency
- Ready for production use
- Supports MongoDB queries and aggregations

---

**Last Updated:** January 30, 2026
**Version:** 1.0
