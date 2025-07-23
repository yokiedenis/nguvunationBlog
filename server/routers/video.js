// gallery-service/routes/videos.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { storage, bucket } = require('../gcp/index.js');
const Gallery = require('../models/GallerySchema');
const formidable = require('formidable');
const path = require('path');

// Verify JWT token middleware
function verifyToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Authorization token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Public route to get any user's gallery
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const gallery = await Gallery.findOne({ userId });
    
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }
    
    // Format response for public viewing
    const publicGallery = {
      userId: gallery.userId,
      videos: gallery.videos.map(video => ({
        _id: video._id,
        title: video.title,
        description: video.description,
        url: video.videoLink,
        thumbnail: video.thumbnail,
        duration: video.duration,
        size: video.size,
        createdAt: video.createdAt,
        views: video.views
      })),
      createdAt: gallery.createdAt
    };
    
    res.json(publicGallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected routes below (require authentication)
router.use(verifyToken);

// Get current user's gallery with full details
router.get('/me', async (req, res) => {
  try {
    const gallery = await Gallery.findOne({ userId: req.user.userId });
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }
    
    // Format storage data for frontend
    const formattedGallery = {
      ...gallery._doc,
      freeStorage: gallery.freeStorage,
      totalStorage: 50 * 1024 * 1024, // 50MB
      freeBandwidth: gallery.freeBandwidth,
      totalBandwidth: 100 * 1024 * 1024 // 100MB
    };
    
    res.json(formattedGallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload video with formidable
router.post('/add/:userId', (req, res) => {
  const form = new formidable.IncomingForm();
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error occurred during file upload' });
    }

    const userId = req.params.userId;
    const videoFile = files.video?.[0] || files.video;
    
    try {
      if (!videoFile) {
        return res.status(400).json({ message: 'No video file uploaded' });
      }

      const gallery = await Gallery.findOne({ userId });
      if (!gallery) {
        return res.status(404).json({ message: 'Gallery not found' });
      }

      // Check storage and bandwidth
      if (videoFile.size > gallery.freeStorage) {
        return res.status(400).json({ 
          message: 'Insufficient storage space' 
        });
      }

      if (videoFile.size > gallery.freeBandwidth) {
        return res.status(400).json({ 
          message: 'Video exceeds daily bandwidth limit' 
        });
      }

      // Validate file extension
      const validExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
      const fileExtension = path.extname(videoFile.originalFilename).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        return res.status(400).json({ 
          message: `Invalid file type. Supported types: ${validExtensions.join(', ')}`
        });
      }

      // Upload to GCP
      const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const fileName = `${uniqueId}-${videoFile.originalFilename}`;
      const filePath = `videos/${userId}/${fileName}`;
      const videoUrl = await uploadToGCP(videoFile.filepath, filePath);

      // Create video object
      const video = {
        title: fields.title?.[0] || 'Untitled',
        description: fields.description?.[0] || '',
        videoLink: videoUrl,
        publicId: filePath,
        thumbnail: fields.thumbnail?.[0] || '',
        size: videoFile.size,
        duration: fields.duration?.[0] || 0,
        createdAt: new Date()
      };

      // Update gallery
      gallery.videos.push(video);
      gallery.freeStorage -= video.size;
      gallery.freeBandwidth -= video.size;
      await gallery.save();

      // Emit event to other services
      try {
        await axios.post(`${process.env.FRONTEND_CLIENT_URL}/events`, {
          type: 'videoAdded',
          clientIp: clientIp,
          data: {
            userId,
            video,
            gallery
          }
        });
      } catch (eventError) {
        console.error('Event service error:', eventError.message);
      }

      res.status(201).json({
        message: 'Video uploaded successfully',
        video,
        gallery
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
});

// Delete video
router.delete('/:userId/:videoId', async (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userId = req.params.userId;
  const videoId = req.params.videoId;

  try {
    const gallery = await Gallery.findOne({ userId });
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    const video = gallery.videos.id(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Delete from GCP
    await deleteFromGCP(video.publicId);

    // Update storage
    gallery.freeStorage += video.size;
    gallery.videos.pull(videoId);
    await gallery.save();

    // Emit event to other services
    try {
      await axios.post(`${process.env.FRONTEND_CLIENT_URL}/events`, {
        type: 'videoRemoved',
        clientIp: clientIp,
        data: {
          userId,
          videoId,
          videoSize: video.size,
          gallery
        }
      });
    } catch (eventError) {
      console.error('Event service error:', eventError.message);
    }

    res.json({ 
      message: 'Video deleted successfully',
      gallery
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GCP Upload Helper
async function uploadToGCP(filePath, destination) {
  const [file] = await bucket.upload(filePath, {
    destination,
    resumable: true,
    metadata: {
      contentType: 'video/mp4'
    }
  });
  return file.metadata.mediaLink;
}

// GCP Delete Helper
async function deleteFromGCP(filePath) {
  await bucket.file(filePath).delete();
}

module.exports = router;