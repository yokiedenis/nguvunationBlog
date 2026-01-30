const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { bucket } = require("../gcp/index.js");
const formidable = require("formidable");
const path = require("path");
const { Gallery } = require("../models/GallerySchema");
const Event = require("../models/EventSchema");

// ============================================================
// MIDDLEWARE
// ============================================================

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json({ message: "Authorization token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Helper function for GCP upload
async function uploadToGCP(filePath, destination) {
  const [file] = await bucket.upload(filePath, {
    destination,
    metadata: {
      contentType: "video/*",
    },
  });
  return `https://storage.googleapis.com/${bucket.name}/${file.name}`;
}

// Helper function to validate video file
function validateVideoFile(videoFile, supportedExtensions) {
  if (!videoFile) {
    return { valid: false, error: "No video file uploaded" };
  }

  const fileExtension = path.extname(videoFile.originalFilename).toLowerCase();
  if (!supportedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: `Invalid file type. Supported: ${supportedExtensions.join(", ")}`,
    };
  }

  return { valid: true };
}

// ============================================================
// USER GALLERY ENDPOINTS (Original Logic Maintained)
// ============================================================

// Get public user gallery
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const gallery = await Gallery.findOne({ userId }).populate(
      "videos.videoCreator",
      "name profileImg",
    );

    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }

    // Filter public videos only for non-owner views
    const isOwner =
      req.user && req.user.userId && req.user.userId.toString() === userId;
    const publicVideos = isOwner
      ? gallery.videos
      : gallery.videos.filter((v) => v.visibility === "public");

    const publicGallery = {
      userId: gallery.userId,
      videos: publicVideos.map((video) => ({
        _id: video._id,
        title: video.title,
        description: video.description,
        url: video.videoLink,
        thumbnail: video.thumbnail,
        duration: video.duration,
        size: video.size,
        category: video.category,
        views: video.views,
        likes: video.likes ? video.likes.length : 0,
        createdAt: video.createdAt,
      })),
      createdAt: gallery.createdAt,
    };

    res.json(publicGallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user's gallery with full details (Protected)
router.get("/me", verifyToken, async (req, res) => {
  try {
    const gallery = await Gallery.findOne({ userId: req.user.userId }).populate(
      "videos.videoCreator",
      "name profileImg",
    );

    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }

    const formattedGallery = {
      ...gallery._doc,
      freeStorage: gallery.freeStorage,
      totalStorage: 50 * 1024 * 1024, // 50MB
      freeBandwidth: gallery.freeBandwidth,
      totalBandwidth: 100 * 1024 * 1024, // 100MB
      videos: gallery.videos.map((v) => ({
        ...v._doc,
        likeCount: v.likes ? v.likes.length : 0,
      })),
    };

    res.json(formattedGallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload video to user gallery (Protected)
router.post("/add/:userId", verifyToken, async (req, res) => {
  const form = new formidable.IncomingForm();
  form.maxFileSize = 1 * 1024 * 1024 * 1024; // 1GB
  form.maxFields = 100;
  form.maxFieldsSize = 50 * 1024 * 1024; // 50MB for all fields combined

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: "Error parsing form data" });
    }

    try {
      const userId = req.params.userId;
      const videoFile = files.video?.[0] || files.video;

      // Validate input
      const validExtensions = [
        ".mp4",
        ".webm",
        ".ogg",
        ".mov",
        ".avi",
        ".mkv",
        ".flv",
      ];
      const validation = validateVideoFile(videoFile, validExtensions);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }

      const gallery = await Gallery.findOne({ userId });
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }

      // Validate storage (1GB limit per file, not 50MB)
      if (videoFile.size > 1 * 1024 * 1024 * 1024) {
        return res.status(400).json({ message: "File exceeds 1GB limit" });
      }

      // Check if user has storage space
      if (videoFile.size > gallery.freeStorage) {
        return res.status(400).json({
          message: "Insufficient storage space",
          required: videoFile.size,
          available: gallery.freeStorage,
        });
      }

      // Check bandwidth
      if (videoFile.size > gallery.freeBandwidth) {
        return res.status(400).json({
          message: "Exceeds daily bandwidth limit",
          required: videoFile.size,
          available: gallery.freeBandwidth,
        });
      }

      // Upload to GCP with optimized settings
      const uniqueId = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`;
      const fileName = `${uniqueId}-${videoFile.originalFilename}`.replace(
        /[^\w.-]/g,
        "",
      );
      const filePath = `videos/${userId}/${fileName}`;

      const videoUrl = await uploadToGCP(videoFile.filepath, filePath);

      // Create video document
      const newVideo = {
        title: fields.title?.[0] || videoFile.originalFilename,
        description: fields.description?.[0] || "",
        videoLink: videoUrl,
        publicId: filePath,
        size: videoFile.size,
        duration: fields.duration?.[0] || 0,
        thumbnail: fields.thumbnail?.[0] || null,
        videoCreator: req.user.userId,
        category: fields.category?.[0] || "other",
        visibility: fields.visibility?.[0] || "public",
        views: 0,
        likes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update gallery
      gallery.videos.push(newVideo);
      gallery.freeStorage -= newVideo.size;
      gallery.freeBandwidth -= newVideo.size;
      gallery.updatedAt = new Date();
      await gallery.save();

      // Emit event to server for storage/usage updates
      try {
        await axios.post(
          `http://localhost:${process.env.PORT || 5000}/storage/events`,
          {
            type: "videosAdded",
            data: {
              userId,
              video: newVideo,
            },
          },
        );
      } catch (storageEventError) {
        console.error("Storage event error:", storageEventError.message);
      }

      try {
        await axios.post(
          `http://localhost:${process.env.PORT || 5000}/usagemonitoring/events`,
          {
            type: "videosAdded",
            data: {
              userId,
              video: newVideo,
            },
          },
        );
      } catch (usageEventError) {
        console.error("Usage event error:", usageEventError.message);
      }

      return res.status(201).json({
        message: "Video uploaded successfully",
        video: newVideo,
      });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ message: error.message });
    }
  });
});

// Delete user video (Protected)
router.delete("/:videoId", verifyToken, async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const userId = req.user.userId;

    const gallery = await Gallery.findOne({ userId });
    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }

    const video = gallery.videos.id(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Verify ownership
    if (video.videoCreator.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this video" });
    }

    // Delete from GCP
    try {
      await bucket.file(video.publicId).delete();
    } catch (gcpError) {
      console.error("GCP deletion error:", gcpError.message);
    }

    // Update storage
    gallery.freeStorage += video.size;
    gallery.videos.pull(videoId);
    gallery.updatedAt = new Date();
    await gallery.save();

    // Emit event to server for storage updates
    try {
      await axios.post(
        `http://localhost:${process.env.PORT || 5000}/storage/events`,
        {
          type: "videoRemoved",
          data: {
            userId,
            videoSize: video.size,
          },
        },
      );
    } catch (storageEventError) {
      console.error("Storage event error:", storageEventError.message);
    }

    res.json({
      message: "Video deleted successfully",
      gallery: {
        freeStorage: gallery.freeStorage,
        freeBandwidth: gallery.freeBandwidth,
      },
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ============================================================
// EVENT GALLERY ENDPOINTS
// ============================================================

// Get event gallery with videos (Public - respects visibility)
router.get("/event/:eventId", async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const category = req.query.category || null;

    // Validate eventId
    if (!eventId || eventId === ":eventId") {
      console.warn("Invalid eventId received:", eventId);
      return res.status(400).json({
        message: "Invalid event ID",
        received: eventId,
      });
    }

    const event = await Event.findById(eventId)
      .populate("organizer", "name profileImg")
      .populate("participants", "name");

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
        eventId: eventId,
      });
    }

    // Get all galleries that have videos for this event
    const galleries = await Gallery.find({
      "videos.eventId": eventId,
    }).populate("videos.videoCreator", "name profileImg");

    let allVideos = [];
    galleries.forEach((gallery) => {
      const eventVideos = gallery.videos.filter(
        (v) => v.eventId && v.eventId.toString() === eventId,
      );
      allVideos = allVideos.concat(eventVideos);
    });

    // Filter by category if specified
    if (category) {
      allVideos = allVideos.filter((v) => v.category === category);
    }

    // Check if user is event participant for visibility filtering
    let isParticipant = false;
    let isOrganizer = false;
    if (req.user) {
      isParticipant = event.participants.some(
        (p) => p._id.toString() === req.user.userId,
      );
      isOrganizer = event.organizer._id.toString() === req.user.userId;
    }

    // Filter videos based on visibility
    const visibleVideos = allVideos.filter((video) => {
      if (video.visibility === "public") return true;
      if (isOrganizer || isParticipant) return true;
      return false;
    });

    // Sort by creation date (newest first)
    visibleVideos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const formattedVideos = visibleVideos.map((video) => ({
      _id: video._id,
      title: video.title,
      description: video.description,
      url: video.videoLink,
      thumbnail: video.thumbnail,
      duration: video.duration,
      size: video.size,
      category: video.category,
      visibility: video.visibility,
      views: video.views,
      likes: video.likes ? video.likes.length : 0,
      videoCreator: video.videoCreator,
      createdAt: video.createdAt,
    }));

    res.json({
      event: {
        _id: event._id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        organizer: event.organizer,
        participantCount: event.participants.length,
        eventType: event.eventType,
      },
      videos: formattedVideos,
      stats: {
        totalVideos: formattedVideos.length,
        totalViews: visibleVideos.reduce((sum, v) => sum + (v.views || 0), 0),
        totalLikes: visibleVideos.reduce(
          (sum, v) => sum + (v.likes ? v.likes.length : 0),
          0,
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching event gallery:", error.message, error.stack);
    res.status(500).json({
      message: error.message,
      error:
        process.env.NODE_ENV === "development" ? error.toString() : undefined,
    });
  }
});

// Get event videos with filtering (Public)
router.get("/event/:eventId/videos", async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { category, sort } = req.query;

    // Validate eventId
    if (!eventId || eventId === ":eventId") {
      console.warn("Invalid eventId received:", eventId);
      return res.status(400).json({
        message: "Invalid event ID",
        received: eventId,
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        message: "Event not found",
        eventId: eventId,
      });
    }

    // Get galleries with event videos
    const galleries = await Gallery.find({
      "videos.eventId": eventId,
    }).populate("videos.videoCreator", "name profileImg");

    let allVideos = [];
    galleries.forEach((gallery) => {
      const eventVideos = gallery.videos.filter(
        (v) => v.eventId && v.eventId.toString() === eventId,
      );
      allVideos = allVideos.concat(eventVideos);
    });

    // Filter by category
    if (category) {
      allVideos = allVideos.filter((v) => v.category === category);
    }

    // Sort videos
    if (sort === "views") {
      allVideos.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sort === "likes") {
      allVideos.sort(
        (a, b) =>
          (b.likes ? b.likes.length : 0) - (a.likes ? a.likes.length : 0),
      );
    } else {
      allVideos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Check if user is participant
    let isParticipant = false;
    if (req.user) {
      isParticipant = event.participants.some(
        (p) => p.toString() === req.user.userId,
      );
    }

    // Filter by visibility
    const visibleVideos = allVideos.filter((video) => {
      if (video.visibility === "public") return true;
      if (isParticipant) return true;
      return false;
    });

    res.json({
      eventId: event._id,
      videos: visibleVideos.map((v) => ({
        _id: v._id,
        title: v.title,
        description: v.description,
        url: v.videoLink,
        thumbnail: v.thumbnail,
        duration: v.duration,
        category: v.category,
        views: v.views,
        likes: v.likes ? v.likes.length : 0,
        videoCreator: v.videoCreator,
        createdAt: v.createdAt,
      })),
      pagination: {
        total: visibleVideos.length,
      },
    });
  } catch (error) {
    console.error("Error fetching event videos:", error.message, error.stack);
    res.status(500).json({
      message: error.message,
      error:
        process.env.NODE_ENV === "development" ? error.toString() : undefined,
    });
  }
});

// Upload video to event gallery (Protected)
router.post("/add/event/:eventId", verifyToken, async (req, res) => {
  const form = new formidable.IncomingForm();
  form.maxFileSize = 1 * 1024 * 1024 * 1024; // 1GB
  form.maxFields = 100;
  form.maxFieldsSize = 50 * 1024 * 1024; // 50MB for all fields combined

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: "Error parsing form data" });
    }

    try {
      const eventId = req.params.eventId;
      const userId = req.user.userId;
      const videoFile = files.video?.[0] || files.video;

      // Validate event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Check if video uploads are allowed (default to true if not set)
      const allowVideoUpload = event.allowVideoUpload !== false;
      if (!allowVideoUpload) {
        return res
          .status(403)
          .json({ message: "Video uploads are disabled for this event" });
      }

      // Auto-join user as participant if not already
      if (!event.participants.includes(userId)) {
        event.participants.push(userId);
        await event.save();
      }

      // Validate video file
      const validExtensions = [
        ".mp4",
        ".webm",
        ".ogg",
        ".mov",
        ".avi",
        ".mkv",
        ".flv",
      ];
      const validation = validateVideoFile(videoFile, validExtensions);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }

      // Get or create gallery for user
      let gallery = await Gallery.findOne({ userId });
      if (!gallery) {
        gallery = new Gallery({
          userId,
          freeStorage: 50 * 1024 * 1024,
          freeBandwidth: 100 * 1024 * 1024,
          videos: [],
          eventGalleries: [],
        });
      }

      // Check file size (1GB limit)
      if (videoFile.size > 1 * 1024 * 1024 * 1024) {
        return res.status(400).json({ message: "File exceeds 1GB limit" });
      }

      // Check storage and bandwidth
      if (videoFile.size > gallery.freeStorage) {
        return res.status(400).json({
          message: "Insufficient storage space",
          required: videoFile.size,
          available: gallery.freeStorage,
        });
      }

      if (videoFile.size > gallery.freeBandwidth) {
        return res.status(400).json({
          message: "Exceeds daily bandwidth limit",
          required: videoFile.size,
          available: gallery.freeBandwidth,
        });
      }

      // Upload to GCP
      const uniqueId = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`;
      const fileName = `${uniqueId}-${videoFile.originalFilename}`.replace(
        /[^\w.-]/g,
        "",
      );
      const filePath = `events/${eventId}/${userId}/${fileName}`;

      const videoUrl = await uploadToGCP(videoFile.filepath, filePath);

      // Create video document
      const newVideo = {
        title: fields.title?.[0] || videoFile.originalFilename,
        description: fields.description?.[0] || "",
        videoLink: videoUrl,
        publicId: filePath,
        size: videoFile.size,
        duration: fields.duration?.[0] || 0,
        thumbnail: fields.thumbnail?.[0] || null,
        eventId: eventId,
        videoCreator: userId,
        category: fields.category?.[0] || "other",
        visibility: fields.visibility?.[0] || "public",
        views: 0,
        likes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update gallery
      gallery.videos.push(newVideo);
      gallery.freeStorage -= newVideo.size;
      gallery.freeBandwidth -= newVideo.size;
      gallery.updatedAt = new Date();

      // Update event gallery stats
      const existingEventGallery = gallery.eventGalleries.find(
        (eg) => eg.eventId.toString() === eventId,
      );
      if (existingEventGallery) {
        existingEventGallery.totalVideos += 1;
      } else {
        gallery.eventGalleries.push({
          eventId: eventId,
          totalVideos: 1,
          totalEngagement: {
            views: 0,
            likes: 0,
          },
        });
      }

      await gallery.save();

      // Update event stats
      event.eventGalleryStats.totalVideos += 1;
      await event.save();

      // Emit event to server for storage/usage updates
      try {
        await axios.post(
          `http://localhost:${process.env.PORT || 5000}/storage/events`,
          {
            type: "videosAdded",
            data: {
              userId,
              video: newVideo,
            },
          },
        );
      } catch (storageEventError) {
        console.error("Storage event error:", storageEventError.message);
      }

      try {
        await axios.post(
          `http://localhost:${process.env.PORT || 5000}/usagemonitoring/events`,
          {
            type: "videosAdded",
            data: {
              userId,
              video: newVideo,
            },
          },
        );
      } catch (usageEventError) {
        console.error("Usage event error:", usageEventError.message);
      }

      // Emit event to videos handler for gallery/event stats update
      try {
        await axios.post(
          `http://localhost:${process.env.PORT || 5000}/videos/events`,
          {
            type: "eventVideoAdded",
            data: {
              userId,
              eventId,
              video: newVideo,
            },
          },
        );
      } catch (videoEventError) {
        console.error("Video event error:", videoEventError.message);
      }

      return res.status(201).json({
        message: "Video uploaded to event successfully",
        video: newVideo,
        eventGalleryStats: {
          totalVideos: event.eventGalleryStats.totalVideos,
          totalViews: event.eventGalleryStats.totalViews,
          totalEngagement: event.eventGalleryStats.totalEngagement,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ message: error.message });
    }
  });
});

// Delete event video (Protected)
router.delete("/event/:eventId/:videoId", verifyToken, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const videoId = req.params.videoId;
    const userId = req.user.userId;

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get gallery
    const gallery = await Gallery.findOne({ userId });
    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }

    const video = gallery.videos.id(videoId);
    if (!video || !video.eventId || video.eventId.toString() !== eventId) {
      return res.status(404).json({ message: "Video not found in event" });
    }

    // Check ownership or organizer permission
    const isOrganizer = event.organizer.toString() === userId;
    const isVideoCreator = video.videoCreator.toString() === userId;

    if (!isOrganizer && !isVideoCreator) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this video" });
    }

    // Delete from GCP
    try {
      await bucket.file(video.publicId).delete();
    } catch (gcpError) {
      console.error("GCP deletion error:", gcpError.message);
    }

    // Update gallery
    gallery.freeStorage += video.size;
    gallery.videos.pull(videoId);
    gallery.updatedAt = new Date();

    // Update event gallery stats
    const eventGallery = gallery.eventGalleries.find(
      (eg) => eg.eventId.toString() === eventId,
    );
    if (eventGallery && eventGallery.totalVideos > 0) {
      eventGallery.totalVideos -= 1;
    }

    await gallery.save();

    // Update event stats
    if (event.eventGalleryStats.totalVideos > 0) {
      event.eventGalleryStats.totalVideos -= 1;
    }
    await event.save();

    // Emit event to server for storage updates
    try {
      await axios.post(
        `http://localhost:${process.env.PORT || 5000}/storage/events`,
        {
          type: "videoRemoved",
          data: {
            userId,
            videoSize: video.size,
          },
        },
      );
    } catch (storageEventError) {
      console.error("Storage event error:", storageEventError.message);
    }

    // Emit event to videos handler for event stats update
    try {
      await axios.post(
        `http://localhost:${process.env.PORT || 5000}/videos/events`,
        {
          type: "eventVideoRemoved",
          data: {
            userId,
            eventId,
            videoSize: video.size,
          },
        },
      );
    } catch (eventError) {
      console.error("Event service error:", eventError.message);
    }

    res.json({
      message: "Video deleted from event successfully",
      gallery: {
        freeStorage: gallery.freeStorage,
        freeBandwidth: gallery.freeBandwidth,
      },
      eventStats: {
        totalVideos: event.eventGalleryStats.totalVideos,
      },
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ============================================================
// ENGAGEMENT ENDPOINTS (Views & Likes)
// ============================================================

// Increment video views
router.post("/:videoId/view", async (req, res) => {
  try {
    const videoId = req.params.videoId;

    const gallery = await Gallery.findOne({
      "videos._id": videoId,
    });

    if (!gallery) {
      return res.status(404).json({ message: "Video not found" });
    }

    const video = gallery.videos.id(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    video.views = (video.views || 0) + 1;
    gallery.updatedAt = new Date();
    await gallery.save();

    // Update event gallery stats if event video
    if (video.eventId) {
      const event = await Event.findById(video.eventId);
      if (event) {
        event.eventGalleryStats.totalViews =
          (event.eventGalleryStats.totalViews || 0) + 1;
        await event.save();
      }
    }

    res.json({
      message: "View recorded",
      views: video.views,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/Unlike video
router.post("/:videoId/like", verifyToken, async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const userId = req.user.userId;

    const gallery = await Gallery.findOne({
      "videos._id": videoId,
    });

    if (!gallery) {
      return res.status(404).json({ message: "Video not found" });
    }

    const video = gallery.videos.id(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check if user already liked
    const likeIndex = video.likes.findIndex((l) => l.toString() === userId);

    if (likeIndex > -1) {
      // Unlike
      video.likes.splice(likeIndex, 1);
      gallery.updatedAt = new Date();
      await gallery.save();

      // Update event stats
      if (video.eventId) {
        const event = await Event.findById(video.eventId);
        if (event && event.eventGalleryStats.totalEngagement > 0) {
          event.eventGalleryStats.totalEngagement -= 1;
          await event.save();
        }
      }

      return res.json({
        message: "Video unliked",
        liked: false,
        likes: video.likes.length,
      });
    } else {
      // Like
      video.likes.push(userId);
      gallery.updatedAt = new Date();
      await gallery.save();

      // Update event stats
      if (video.eventId) {
        const event = await Event.findById(video.eventId);
        if (event) {
          event.eventGalleryStats.totalEngagement =
            (event.eventGalleryStats.totalEngagement || 0) + 1;
          await event.save();
        }
      }

      return res.json({
        message: "Video liked",
        liked: true,
        likes: video.likes.length,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================================
// ANALYTICS ENDPOINTS
// ============================================================

// Get event video analytics (Protected - organizer only)
router.get("/event/:eventId/analytics", verifyToken, async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Verify user is event organizer
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Only event organizer can view analytics",
      });
    }

    // Get all videos for event
    const galleries = await Gallery.find({
      "videos.eventId": eventId,
    }).populate("videos.videoCreator", "name profileImg");

    let allVideos = [];
    galleries.forEach((gallery) => {
      const eventVideos = gallery.videos.filter(
        (v) => v.eventId && v.eventId.toString() === eventId,
      );
      allVideos = allVideos.concat(eventVideos);
    });

    // Calculate analytics
    const analytics = {
      eventId: event._id,
      eventTitle: event.title,
      eventType: event.eventType,
      totalVideos: allVideos.length,
      totalViews: allVideos.reduce((sum, v) => sum + (v.views || 0), 0),
      totalEngagement: allVideos.reduce(
        (sum, v) => sum + (v.likes ? v.likes.length : 0),
        0,
      ),
      videosByCategory: {},
      videosByVisibility: {
        public: 0,
        private: 0,
        membersOnly: 0,
      },
      topVideos: [],
      engagement: {
        avgViewsPerVideo:
          allVideos.length > 0
            ? Math.round(
                allVideos.reduce((sum, v) => sum + (v.views || 0), 0) /
                  allVideos.length,
              )
            : 0,
        avgLikesPerVideo:
          allVideos.length > 0
            ? Math.round(
                allVideos.reduce(
                  (sum, v) => sum + (v.likes ? v.likes.length : 0),
                  0,
                ) / allVideos.length,
              )
            : 0,
        engagementRate:
          allVideos.length > 0
            ? (
                (allVideos.reduce((sum, v) => sum + (v.views || 0), 0) /
                  allVideos.length) *
                100
              ).toFixed(2) + "%"
            : "0%",
      },
    };

    // Categorize videos
    allVideos.forEach((video) => {
      const cat = video.category;
      analytics.videosByCategory[cat] =
        (analytics.videosByCategory[cat] || 0) + 1;
      analytics.videosByVisibility[video.visibility] += 1;
    });

    // Get top 5 videos by views
    const topVideos = [...allVideos]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);

    analytics.topVideos = topVideos.map((v) => ({
      _id: v._id,
      title: v.title,
      views: v.views,
      likes: v.likes ? v.likes.length : 0,
      category: v.category,
      createdAt: v.createdAt,
      uploadedBy: v.videoCreator,
    }));

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user video statistics (Protected)
router.get("/me/stats", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const gallery = await Gallery.findOne({ userId }).populate(
      "videos.videoCreator",
    );

    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }

    const stats = {
      userId,
      totalVideos: gallery.videos.length,
      totalViews: gallery.videos.reduce((sum, v) => sum + (v.views || 0), 0),
      totalLikes: gallery.videos.reduce(
        (sum, v) => sum + (v.likes ? v.likes.length : 0),
        0,
      ),
      storageUsed: gallery.videos.reduce((sum, v) => sum + v.size, 0),
      storageFree: gallery.freeStorage,
      bandwidthFree: gallery.freeBandwidth,
      videosByCategory: {},
      eventVideos: gallery.eventGalleries.length,
    };

    // Categorize videos
    gallery.videos.forEach((video) => {
      stats.videosByCategory[video.category] =
        (stats.videosByCategory[video.category] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
