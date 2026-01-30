# Quick Start Testing Guide

## Prerequisites

- Backend running on http://localhost:5000
- Frontend running on http://localhost:5173
- Logged in with a user account
- Valid JWT token in localStorage

## Step-by-Step Testing

### 1. Create an Event

```
1. Navigate to Events page
2. Click "Create Event" button
3. Fill in form:
   - Title: "Test Event"
   - Description: "Test Description"
   - Start Date: Today + 1 day
   - End Date: Today + 2 days
   - Location: "Test Location"
4. Click "Create Event"
5. Should see success toast
6. Event should appear in list
```

### 2. View Event Details

```
1. Click on event card in list
2. Should navigate to /events/:eventId
3. Should see:
   - Event title and description
   - Event dates and location
   - 0 videos (initially)
   - "Upload Video" button (if authenticated)
```

### 3. Upload Video to Event

```
1. On event gallery page, click "Upload Video"
2. Upload form modal opens
3. Select video file (MP4, WebM, etc)
4. Fill in title and description
5. Click "Upload"
6. Should see progress
7. Success toast notification
8. Video appears in event gallery
```

### 4. Verify Video Appears

```
1. Video should show in event gallery
2. Check video details:
   - Thumbnail
   - Title
   - Creator name
   - View count (0 initially)
3. Click video to play
4. View count should increase
```

### 5. Delete Video

```
1. Find video in gallery
2. Click delete/trash icon
3. Confirm deletion
4. Video removed from gallery
5. Success toast notification
```

## Expected Network Requests

### Create Event

```
POST /events
Headers: Authorization: Bearer <token>
Body: { title, description, startDate, endDate, location }
Response: { event: {...} }
```

### Upload to Event

```
POST /videos/add/event/:eventId
Headers: Authorization: Bearer <token>
Body: FormData with video file and metadata
Response: { video: {...} }
Triggers:
- POST /storage/events (videosAdded)
- POST /usagemonitoring/events (videosAdded)
- POST /videos/events (eventVideoAdded)
```

### Get Event Gallery

```
GET /videos/event/:eventId/videos
Response: { eventId, videos: [...], pagination: {...} }
```

## Troubleshooting

### Error: "Event fetch failed: 400"

- Check if eventId is valid MongoDB ObjectId
- Verify event exists in database
- Check browser console for detailed error

### Error: "Failed to load resource: 403 (Forbidden)"

- User not authorized to upload
- Need to join event first OR
- Event may require organizer to upload
- Check event videoUploadRestriction setting

### Error: "Insufficient storage space"

- User has used up free storage (50MB)
- Need to delete other videos first
- Or contact admin for more storage

### Error: "Exceeds daily bandwidth limit"

- User has exceeded daily bandwidth (100MB)
- Bandwidth resets daily
- Wait or delete videos to free up

### Video doesn't appear after upload

- Check if POST to storage/events succeeded
- Check if POST to usagemonitoring/events succeeded
- Check if POST to videos/events succeeded
- Server might not be handling EventCreated properly

## Browser Developer Tools Checks

1. **Network Tab**:
   - All API requests return 200/201
   - No 4xx or 5xx errors
   - Authorization header present

2. **Console Tab**:
   - No JavaScript errors
   - Auth context shows current user
   - Token available in localStorage

3. **Storage Tab**:
   - localStorage has 'token' key
   - Token is valid JWT
   - User object accessible

## Performance Metrics

- Event list load: < 500ms
- Event detail load: < 500ms
- Video upload: Depends on file size
- Video gallery load: < 500ms

## Success Criteria

✅ Can create event
✅ Event appears in list
✅ Can navigate to event details
✅ Can upload video to event
✅ Video appears in event gallery
✅ Can view video
✅ View count increases
✅ Can delete video
✅ Can delete event (admin only)

---

**Last Updated**: January 30, 2026
