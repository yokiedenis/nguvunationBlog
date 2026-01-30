# Frontend-Backend Integration Guide

## Overview

This document outlines the complete integration of the video events system with the React frontend.

## Environment Setup

### Frontend (Vite)

Located at: `client/.env`

```
VITE_SERVER_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=...
```

### Backend

Located at: `server/.env`

```
PORT=5000
MONGODB_URI=your_mongo_uri
JWT_SECRET_KEY=your_jwt_secret
GCP_PROJECT_ID=your_gcp_project
GCP_BUCKET_NAME=your_bucket_name
FRONTEND_CLIENT_URL=http://localhost:5173
```

## API Endpoints

### Events

- **GET** `/events` - Get all events
- **POST** `/events` - Create event (Protected)
- **GET** `/events/:eventId` - Get event details
- **POST** `/events/:eventId/join` - Join event (Protected)

### Videos

- **GET** `/videos/user/:userId` - Get user gallery (public)
- **GET** `/videos/me` - Get current user's gallery (Protected)
- **POST** `/videos/add/:userId` - Upload to user gallery (Protected)
- **DELETE** `/videos/:videoId` - Delete user video (Protected)
- **GET** `/videos/event/:eventId` - Get event gallery
- **GET** `/videos/event/:eventId/videos` - Get event videos with filters
- **POST** `/videos/add/event/:eventId` - Upload to event (Protected)
- **DELETE** `/videos/event/:eventId/:videoId` - Delete event video (Protected)
- **POST** `/:videoId/view` - Record view
- **POST** `/:videoId/like` - Like/Unlike video (Protected)
- **GET** `/videos/event/:eventId/analytics` - Get event analytics (Protected - organizer)
- **GET** `/videos/me/stats` - Get user stats (Protected)

## Component Structure

### Pages

- **EventList** (`pages/eventList.jsx`)
  - Displays all events
  - Create event button (logged in users)
  - Links to event galleries

- **EventGallery** (`pages/EventGallery.jsx`)
  - Shows event details
  - Displays all uploaded videos for event
  - Upload video button (authenticated users)
  - Video grid display

### Components

- **CreateEventModal** (`components/CreateEventModal.jsx`)
  - Modal for creating new events
  - Form validation
  - Event creation API call

- **UploadForm** (`components/uploadForm.jsx`)
  - Modal for uploading videos
  - Handles both user and event uploads
  - Video preview
  - File validation (type, size)

- **VideoPlayer** (`components/videoPlayer.jsx`)
  - Video card display
  - Click to play
  - Shows views and likes

## Complete Flow: Creating Event and Uploading Video

### Step 1: User Navigates to Events

```
EventList Component Loads
↓
fetch("http://localhost:5000/events")
↓
Display all events in grid
```

### Step 2: User Creates Event

```
User clicks "Create Event" button
↓
CreateEventModal opens
↓
User fills form (title, description, dates, location)
↓
POST "http://localhost:5000/events"
  Headers: Authorization: Bearer {token}
  Body: { title, description, startDate, endDate, location }
↓
Server:
  - Creates Event document
  - Emits EventCreated to /videos/events
  - Returns event with _id
↓
Frontend:
  - Adds event to events list
  - Closes modal
  - Toast: "Event created successfully!"
```

### Step 3: User Navigates to Event Gallery

```
EventList shows new event
↓
User clicks "View Gallery & Videos"
↓
EventGallery Component Loads with eventId
↓
Fetches:
  - GET /events/{eventId}
  - GET /videos/event/{eventId}
↓
Displays event details and empty video grid
```

### Step 4: User Uploads Video to Event

```
User clicks "Share Your Video" button
↓
UploadForm modal opens with eventId
↓
User selects video file, adds title/description
↓
POST /videos/add/event/{eventId}
  Headers: Authorization: Bearer {token}
  FormData: { video, title, description, eventId }
↓
Server:
  - Validates upload permissions
  - Uploads to GCP Cloud Storage
  - Creates video document
  - Updates Gallery.videos array
  - Updates Gallery.eventGalleries
  - Emits 3 events:
    1. POST /storage/events (type: videosAdded)
    2. POST /usagemonitoring/events (type: videosAdded)
    3. POST /videos/events (type: eventVideoAdded)
  - Returns created video
↓
Event Handlers:
  - /storage/events: Updates Storage model (UsedStorage, FreeStorage)
  - /usagemonitoring/events: Updates Usage model (bandwidth)
  - /videos/events: Updates Event.eventGalleryStats.totalVideos
↓
Frontend:
  - Toast: "Video uploaded successfully!"
  - Closes upload modal
  - Re-fetches event gallery
  - Video appears in grid
```

## Authentication Flow

### Token Management

1. User logs in via Login page
2. Server returns JWT token
3. Frontend stores in localStorage via `storeTokenInLS(token)`
4. AuthProvider sets `useAuth().token`
5. AuthProvider fetches user data from `/api/user` with token

### API Calls

All protected endpoints require:

```javascript
headers: {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json" // or multipart/form-data
}
```

## Common Issues & Solutions

### Issue: "ReferenceError: process is not defined"

**Cause**: Using `process.env` in Vite frontend
**Solution**: Use `import.meta.env.VITE_*` instead

### Issue: "POST http://localhost:5000/videos/add/undefined 404"

**Cause**: userId not extracted from user object
**Solution**: Use `user._id` or `user.userId` (check auth response)

### Issue: "Events not showing in EventGallery"

**Cause**: Wrong endpoint or eventId not passed
**Solution**:

- Verify eventId in URL params: `useParams()`
- Check endpoint: `/videos/event/{eventId}` not `/videos/{eventId}`

### Issue: "Upload fails with 401"

**Cause**: Missing or invalid token
**Solution**: Check token exists in localStorage, not expired

### Issue: "Event creation succeeds but videos don't fetch"

**Cause**: EventCreated event not triggering gallery initialization
**Solution**: Verify server.js has EventCreated handler in /videos/events

## Testing Checklist

- [ ] Events list loads correctly
- [ ] User can create new event
- [ ] New event appears in list immediately
- [ ] User can navigate to event gallery
- [ ] Event details display correctly
- [ ] Video upload form opens and shows eventId
- [ ] User can select and preview video
- [ ] Video uploads successfully
- [ ] Upload progress shows
- [ ] Video appears in event gallery immediately
- [ ] Video shows correct title, description, thumbnail
- [ ] Video play/pause works
- [ ] Storage quotas update after upload
- [ ] Multiple videos show in gallery
- [ ] Delete video removes from gallery
- [ ] Event analytics show correct counts

## Data Structures

### Event Document

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  location: String,
  organizer: ObjectId (User),
  participants: [ObjectId],
  eventGalleryStats: {
    totalVideos: Number,
    totalViews: Number,
    totalEngagement: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Gallery Document

```javascript
{
  _id: ObjectId,
  userId: String,
  videos: [{
    _id: ObjectId,
    title: String,
    description: String,
    videoLink: String (GCP URL),
    size: Number,
    duration: Number,
    eventId: ObjectId (optional),
    views: Number,
    likes: [ObjectId],
    createdAt: Date
  }],
  eventGalleries: [{
    eventId: ObjectId,
    totalVideos: Number
  }],
  freeStorage: Number,
  freeBandwidth: Number
}
```

### Video Response (from /videos/event/{eventId})

```javascript
{
  event: {
    _id: String,
    title: String,
    description: String,
    startDate: Date,
    endDate: Date,
    location: String,
    organizer: { name, profileImg },
    participantCount: Number,
    eventType: String
  },
  videos: [{
    _id: String,
    title: String,
    description: String,
    url: String (videoLink),
    thumbnail: String,
    duration: Number,
    category: String,
    visibility: String,
    views: Number,
    likes: Number,
    videoCreator: { _id, name, profileImg },
    createdAt: Date
  }],
  stats: {
    totalVideos: Number,
    totalViews: Number,
    totalLikes: Number
  }
}
```

## Event Emission System

### Event Types

1. **EventCreated**
   - Emitted by: POST /events
   - Sent to: /videos/events handler
   - Action: Initialize event gallery stats

2. **videosAdded**
   - Emitted by: POST /videos/add/:userId, POST /videos/add/event/:eventId
   - Sent to: /storage/events, /usagemonitoring/events
   - Actions: Update storage quotas, bandwidth usage

3. **videoRemoved**
   - Emitted by: DELETE /videos/:videoId, DELETE /videos/event/:eventId/:videoId
   - Sent to: /storage/events
   - Actions: Restore storage quotas

4. **eventVideoAdded**
   - Emitted by: POST /videos/add/event/:eventId
   - Sent to: /videos/events
   - Actions: Update event stats (totalVideos)

5. **eventVideoRemoved**
   - Emitted by: DELETE /videos/event/:eventId/:videoId
   - Sent to: /videos/events
   - Actions: Decrement event stats

## Deployment Notes

### Development

- Frontend: `npm run dev` (Vite, port 5173)
- Backend: `npm run dev` or `node server.js` (port 5000)

### Production

- Update `VITE_SERVER_URL` to production backend URL
- Ensure CORS is configured for production domain
- Set proper JWT expiration
- Use environment-specific .env files
