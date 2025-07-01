// gallery-service/routes/videos.js
const express = require('express');
const router = express.Router();
const Gallery = require('../models/GallerySchema');
const authenticate = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/videos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Public route to get any user's gallery (no authentication required)
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
        url: video.url,
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
router.use(authenticate);

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

// Upload video
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const user = req.user;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }
    
    const gallery = await Gallery.findOne({ userId: user.userId });
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }
    
    // Check storage space
    if (file.size > gallery.freeStorage) {
      fs.unlinkSync(file.path); // Delete uploaded file
      return res.status(400).json({ 
        message: 'Insufficient storage space' 
      });
    }
    
    // Create video object
    const video = {
      title: req.body.title || 'Untitled',
      description: req.body.description || '',
      url: `/uploads/videos/${file.filename}`,
      thumbnail: req.body.thumbnail || '',
      size: file.size,
      duration: req.body.duration || 0,
      createdAt: new Date()
    };
    
    // Update gallery
    gallery.videos.push(video);
    gallery.freeStorage -= file.size;
    await gallery.save();
    
    res.status(201).json({
      message: 'Video uploaded successfully',
      video
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific video by ID
router.get('/:videoId', async (req, res) => {
  try {
    const gallery = await Gallery.findOne({ userId: req.user.userId });
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }
    
    const video = gallery.videos.id(req.params.videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete video
router.delete('/:videoId', async (req, res) => {
  try {
    const gallery = await Gallery.findOne({ userId: req.user.userId });
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }
    
    const video = gallery.videos.id(req.params.videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Free up storage space
    gallery.freeStorage += video.size;
    
    // Remove video from array
    gallery.videos.pull(req.params.videoId);
    await gallery.save();
    
    // Delete video file from server
    const videoPath = path.join(__dirname, '../../uploads/videos', video.url.split('/').pop());
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
    
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;