# Video Events System - Feature Guide

## What's New?

Complete video events system allowing users to:

- ✅ Create events (title, description, dates, location)
- ✅ Browse all events
- ✅ Upload videos to events
- ✅ View all event videos
- ✅ Track storage and bandwidth usage
- ✅ View event analytics (for organizers)

## Quick Start

### For Users

#### Create an Event

1. Navigate to Events page
2. Click "Create Event" button (must be logged in)
3. Fill in event details:
   - **Title**: Event name
   - **Description**: Event details
   - **Start Date**: When event begins
   - **End Date**: When event ends
   - **Location**: Where event is held
4. Click "Create Event"
5. Event is created and appears in the events list

#### Upload Video to Event

1. Navigate to Events page
2. Click event title or "View Gallery & Videos"
3. Click "Share Your Video" button (must be logged in)
4. Select video file:
   - Supported formats: MP4, WebM, Ogg, MOV, AVI
   - Max size: 100MB
5. Add video details:
   - **Title**: Video title
   - **Description**: What's in the video
6. Click "Upload Video"
7. Video appears in event gallery

#### View Event Gallery

1. Navigate to Events page
2. Click event title or "View Gallery & Videos"
3. See event details and all uploaded videos
4. Click any video to watch
5. View counter and likes displayed

### For Organizers

#### Manage Event

- Create event to establish gathering point
- Monitor video uploads in real-time
- View event analytics:
  - Total videos uploaded
  - Total views across all videos
  - Total engagement (likes)
  - Top performing videos
  - Videos by category

## Features Breakdown

### Event Management

- **Create Events**: Define when, where, and why
- **Event Details**: Full event information display
- **Automatic Gallery**: Gallery created when event is created
- **Event Stats**: Track videos and engagement

### Video Upload

- **File Validation**: Only video files, max 100MB
- **Preview**: See video before uploading
- **Automatic Upload**: Videos uploaded to secure GCP storage
- **Metadata Storage**: Title, description, size, duration tracked
- **Event Association**: Videos linked to event automatically

### Video Gallery

- **Event Videos**: All videos for an event in one place
- **Public/Private**: Control visibility
- **Filtering**: Filter by category or sorting
- **Search**: Find specific videos
- **Engagement**: Track views and likes

### Storage Management

- **Storage Quota**: 50MB free storage per user
- **Bandwidth Quota**: 100MB free bandwidth per user
- **Real-time Tracking**: Usage updated on each upload
- **Quota Alerts**: Notified when quota low
- **Premium Storage**: Upgrade options available

### Analytics

- **Event Views**: Total views across all event videos
- **Engagement Rate**: Likes per video average
- **Top Videos**: Most viewed videos for event
- **Category Breakdown**: Videos by content type
- **Timeline**: View trends over event duration

## Component Usage

### For Developers

#### Using CreateEventModal

```jsx
import CreateEventModal from "@/components/CreateEventModal";

<CreateEventModal
  isOpen={isOpen}
  onClose={handleClose}
  onSuccess={handleEventCreated}
/>;
```

#### Using UploadForm

```jsx
import UploadForm from "@/components/uploadForm";

<UploadForm
  eventId={eventId}
  onClose={handleClose}
  onSuccess={handleUploadSuccess}
/>;
```

#### Using VideoPlayer

```jsx
import VideoPlayer from "@/components/videoPlayer";

<VideoPlayer video={videoData} />;
```

## API Endpoints Summary

### Events

| Method | Endpoint                | Authentication | Purpose           |
| ------ | ----------------------- | -------------- | ----------------- |
| GET    | `/events`               | Optional       | Get all events    |
| POST   | `/events`               | Required       | Create new event  |
| GET    | `/events/:eventId`      | Optional       | Get event details |
| POST   | `/events/:eventId/join` | Required       | Join event        |

### Videos

| Method | Endpoint                           | Authentication | Purpose            |
| ------ | ---------------------------------- | -------------- | ------------------ |
| POST   | `/videos/add/event/:eventId`       | Required       | Upload to event    |
| GET    | `/videos/event/:eventId`           | Optional       | Get event gallery  |
| DELETE | `/videos/event/:eventId/:videoId`  | Required       | Delete event video |
| POST   | `/:videoId/view`                   | Optional       | Record view        |
| POST   | `/:videoId/like`                   | Required       | Like video         |
| GET    | `/videos/event/:eventId/analytics` | Required       | Get analytics      |

## Data Models

### Event

```javascript
{
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  location: String,
  organizer: ObjectId,
  participants: [ObjectId],
  eventGalleryStats: {
    totalVideos: Number,
    totalViews: Number,
    totalEngagement: Number
  }
}
```

### Video (in Gallery)

```javascript
{
  title: String,
  description: String,
  videoLink: String, // GCP URL
  size: Number,
  duration: Number,
  eventId: ObjectId, // For event videos
  views: Number,
  likes: [ObjectId],
  visibility: String, // 'public', 'private', 'membersOnly'
  category: String
}
```

## Common Workflows

### Workflow 1: Event Organizer Creates Event and Monitors

```
1. Organizer logs in
2. Navigates to Events
3. Clicks "Create Event"
4. Fills event details
5. Event is created
6. Navigates to event
7. Views event gallery (empty initially)
8. Waits for participants to upload
9. Participants upload videos
10. Videos appear in gallery
11. Organizer can view analytics
```

### Workflow 2: Participant Uploads to Event

```
1. Participant logs in
2. Navigates to Events
3. Finds relevant event
4. Clicks "View Gallery & Videos"
5. Clicks "Share Your Video"
6. Selects video file
7. Adds title and description
8. Clicks "Upload Video"
9. File is uploaded to storage
10. Video appears in event gallery
11. Storage quota updated
```

### Workflow 3: Viewer Watches Event Videos

```
1. User navigates to Events
2. Clicks event title
3. Sees all uploaded videos
4. Clicks video to play
5. Video player opens
6. Views counter increments
7. Can like video (if logged in)
8. Explores other videos
9. Reads event details
10. May join event
```

## Configuration

### Environment Variables

```
Frontend (.env):
VITE_SERVER_URL=http://localhost:5000

Backend (.env):
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET_KEY=your_secret
GCP_PROJECT_ID=your_project
GCP_BUCKET_NAME=your_bucket
```

### Quotas (Configurable)

- Initial Storage: 50MB per user
- Initial Bandwidth: 100MB per user
- Max File Size: 100MB per video
- Supported Formats: MP4, WebM, Ogg, MOV, AVI

## Performance Considerations

### Optimization

- Videos served from GCP CDN
- Lazy loading of event galleries
- Video metadata cached
- Efficient queries with indexes
- Event stats aggregated

### Scalability

- Cloud storage handles unlimited videos
- Event system supports unlimited participants
- Real-time updates via event emissions
- Horizontal scaling ready

## Security Features

### Authentication

- JWT token authentication
- Protected API endpoints
- Token expiration
- Secure header transmission

### File Security

- File type validation (magic bytes)
- File size limits
- Scan for malicious content
- CORS configured

### Data Security

- Encrypted storage connections
- User ownership verification
- Event organizer permissions
- Private video access control

## Troubleshooting

### Video Won't Upload

- Check file size (< 100MB)
- Check file format (MP4, WebM, Ogg, MOV, AVI)
- Check storage quota
- Check internet connection
- Check browser console for errors

### Event Won't Create

- Ensure logged in
- Check all fields filled
- Ensure end date > start date
- Check server is running
- Check network connectivity

### Videos Not Showing in Gallery

- Wait for upload to complete
- Try refreshing page
- Check event ID is correct
- Verify event exists
- Check video visibility settings

### Storage Quota Issues

- View current usage in settings
- Delete old videos to free space
- Upgrade to premium storage
- Contact support for quota increase

## Future Enhancements

### Planned Features

- [ ] Live event streaming
- [ ] Event notifications
- [ ] Video comments and replies
- [ ] Event recommendations
- [ ] Bulk video uploads
- [ ] Video editing tools
- [ ] Custom video thumbnails
- [ ] Event categories and tags
- [ ] Event search and discovery
- [ ] Video transcoding/compression
- [ ] Bandwidth optimization
- [ ] Premium storage tiers
- [ ] Event sponsorships
- [ ] Video monetization
- [ ] Analytics dashboard

## Support

### Getting Help

1. Check troubleshooting section
2. Review INTEGRATION_GUIDE.md
3. Check browser console for errors
4. Contact development team

### Reporting Issues

- Screenshot of error
- Steps to reproduce
- Browser and OS info
- Console error messages
- API response details

## License

This feature is part of the NguvuNation Blog platform.
All rights reserved.

---

**Last Updated**: January 30, 2026
**Version**: 1.0.0
**Status**: Production Ready
