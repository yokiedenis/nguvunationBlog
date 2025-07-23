const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { bucket } = require('../gcp/index.js');
const formidable = require('formidable');
const path = require('path');
const Gallery = require('../models/GallerySchema');

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Authorization token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Upload video endpoint
router.post('/add/:userId', verifyToken, async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error parsing form data' });
    }

    try {
      const userId = req.params.userId;
      const videoFile = files.video?.[0] || files.video;
      
      // Validate input
      if (!videoFile) {
        return res.status(400).json({ message: 'No video file uploaded' });
      }

      const gallery = await Gallery.findOne({ userId });
      if (!gallery) {
        return res.status(404).json({ message: 'Gallery not found' });
      }

      // Validate storage and bandwidth
      if (videoFile.size > gallery.freeStorage) {
        return res.status(400).json({ message: 'Insufficient storage space' });
      }

      if (videoFile.size > gallery.freeBandwidth) {
        return res.status(400).json({ message: 'Exceeds daily bandwidth limit' });
      }

      // Validate file extension
      const validExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
      const fileExtension = path.extname(videoFile.originalFilename).toLowerCase();
      if (!validExtensions.includes(fileExtension)) {
        return res.status(400).json({ 
          message: `Invalid file type. Supported: ${validExtensions.join(', ')}`
        });
      }

      // Upload to GCP
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const fileName = `${uniqueId}-${videoFile.originalFilename}`.replace(/[^\w.-]/g, '');
      const filePath = `videos/${userId}/${fileName}`;
      
      const videoUrl = await uploadToGCP(videoFile.filepath, filePath);

      // Create video document
      const newVideo = {
        title: fields.title?.[0] || videoFile.originalFilename,
        description: fields.description?.[0] || '',
        videoLink: videoUrl,
        publicId: filePath,
        size: videoFile.size,
        duration: 0, // You can extract this later using FFmpeg
        createdAt: new Date()
      };

      // Update gallery
      gallery.videos.push(newVideo);
      gallery.freeStorage -= newVideo.size;
      gallery.freeBandwidth -= newVideo.size;
      await gallery.save();

      // Emit event to other services
      try {
        await axios.post(`${process.env.FRONTEND_CLIENT_URL}/events`, {
          type: 'videoAdded',
          data: {
            userId,
            video: newVideo,
            gallery: {
              freeStorage: gallery.freeStorage,
              freeBandwidth: gallery.freeBandwidth
            }
          }
        });
      } catch (eventError) {
        console.error('Event service error:', eventError.message);
      }

      return res.status(201).json({
        message: 'Video uploaded successfully',
        video: newVideo
      });

    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ message: error.message });
    }
  });
});

// Helper function for GCP upload
async function uploadToGCP(filePath, destination) {
  const [file] = await bucket.upload(filePath, {
    destination,
    metadata: {
      contentType: 'video/*'
    }
  });
  return `https://storage.googleapis.com/${bucket.name}/${file.name}`;
}

module.exports = router;