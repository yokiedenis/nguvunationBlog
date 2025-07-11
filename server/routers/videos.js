const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { storage,bucket,bucketName } = require("../gcp/index.js");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { Gallery } = require("../models/GallerySchema.js");
const formidable = require('formidable');
const path =require("path");



function verifyToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token)
    return res.status(401).json({ message: "Authorization token missing" });

  try {
    console.log(process.env.JWT_SECRET)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
   
    return res.status(401).json({ message: "Invalid token" });
  }
}



router.get("/:userId", verifyToken, async (req, res) => {
  const userId = req.params.userId;

  try {
    const userGallery = await Gallery.findOne({ userId });

    if (!userGallery) {
      return res.status(404).json({ error: 'User gallery not found' });
    }

    res.status(200).json({ gallery: userGallery });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user gallery' });
  }
});





  router.post("/add/:userId",verifyToken, async (req, res) => {
    const form = new formidable.IncomingForm();
    const clientIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    console.log("Client IP Address:", clientIp); // Log the IP address
  
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error occurred during file upload' });
      }
  
      const userId = req.params.userId;
      const video = files.video; // The video file uploaded from the frontend
      
      
      try {
        if (!video) {
          return res.status(400).json({ error: 'No video file uploaded' });
        }
  
        const userGallery = await Gallery.findOne({userId:userId});

  
        if (!userGallery) {
          return res.status(404).json({ error: 'User gallery not found' });
        }
        
        const fileSizeMB = video[0].size; // File size in bytes
  
        if (fileSizeMB > userGallery.freeStorage) {
          return res.status(400).json({ error: 'Video size exceeds available storage' });
        }
        console.log("video size",fileSizeMB)
        console.log("free bandwidth",userGallery.freeBandwidth)
        if (fileSizeMB > userGallery.freeBandwidth) {
          console.log("video size",fileSizeMB)
          console.log("free bandwidth",userGallery.freeBandwidth)
          return res.status(400).json({ error: 'Video size exceeds available bandwidth for today' });
        }
  
        const validExtensions = [
          '.mp4','.mov','.avi','.mkv','.wmv','.flv','.webm','.m4v','.3gp','.3g2','.f4v','.f4p','.f4a','.f4b','.ogg',
          '.ogv','.ts', '.m2ts','.mts', '.mp3'
        ];
        
        const fileExtension = path.extname(video[0].originalFilename).toLowerCase();
  
        if (!validExtensions.includes(fileExtension)) {
          return res.status(400).json({ error: 'Invalid file extension. Supported extensions are: ' + validExtensions.join(', ') });
        }
  
        const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const fileName = `${uniqueId}-${video[0].originalFilename}`;
        const fileUploadPathdirty = `videos/${userId}/${fileName}`; // Unique file path in the GCP bucket
        const fileUploadPath= fileUploadPathdirty.replace(/[\n\r]/g, '').trim();
  
        const uploadedVideoUrl = await uploadToGCP(video[0].filepath, fileUploadPath);
  
        const newVideo = {
          title: video[0].originalFilename,
          size: fileSizeMB,
          videoLink: uploadedVideoUrl,
          publicId: fileUploadPath, // Store the path to use it for future delete/update operations
        };
  
        userGallery.videos.push(newVideo);
        userGallery.freeStorage -= newVideo.size;
        userGallery.freeBandwidth -= newVideo.size;
  
        await userGallery.save();
  
        // Trigger an event for other microservices
        try {
          await axios.post(`${process.env.EVENT_SERV}/events`, {
            type: "videosAdded",
            clientIp:clientIp,
            data: {
              userId,
              video: newVideo,
              gallery: userGallery
            }
          });
        } catch (error) {
          console.error("Failed to send event to Event Service", error);
        }
  
        res.status(200).json({ message: 'Video uploaded successfully', video: newVideo, gallery: userGallery });
  
      } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ error: 'Failed to upload video' });
      }
    });
  });

  
  // Function to upload video to GCP bucket
  async function uploadToGCP(filePath, destination) {
    try {
      const [file] = await bucket.upload(filePath, {
        destination: destination, // Path in the GCP bucket
        resumable: true, // If the video upload is interrupted, it will resume
        metadata: {
          contentType: 'video/mp4' // Set the MIME type for the video
        }
      });
      // console.log(`Video uploaded to GCP: ${file.metadata.mediaLink}`);
      return file.metadata.mediaLink; // Return the publicly accessible URL
    } catch (error) {
      console.error('Error uploading to GCP:', error);
      throw error;
    }
  }
  



  router.delete("/:userId/:videoId",verifyToken,async (req, res) => {
    const clientIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const userId = req.params.userId;
    const videoId = req.params.videoId;
  
    try {
      // Find the user's gallery
      const userGallery = await Gallery.findOne({ userId });
  
      if (!userGallery) {
        return res.status(404).json({ error: "User gallery not found" });
      }
  
      // Find the video by ID from the user's gallery
      const videoToDelete = userGallery.videos.id(videoId);
      if (!videoToDelete) {
        return res.status(404).json({ error: "Video not found" });
      }
  
      const videoSize = videoToDelete.size; // Get the video size for later update
      const publicId = videoToDelete.publicId; // Get the publicId to delete from GCP
  
      try {
        // Delete the video from Google Cloud Storage (GCP)
        await deleteFromGCP(publicId);
      } catch (error) {
        console.error("Failed to delete video from GCP:", error);
        return res.status(500).json({ error: "Failed to delete video from GCP" });
      }
  
      // Remove the video from the database
      const videoDocument = videoToDelete.toObject(); 
      userGallery.videos.pull({ _id: videoDocument._id });
  
      // Update user's storage and bandwidth
      userGallery.freeStorage += videoSize;
      
  
      // Save the updated gallery document
      await userGallery.save();
  
      // Trigger an event for other microservices
      try {
        await axios.post(`${process.env.EVENT_SERV}/events`, {
          type: "videoRemoved",
          clientIp:clientIp,
          data: {
            userId,
            videoId,
            videoSize,
            gallery: userGallery
          }
        });
      } catch (error) {
        console.error("Failed to send event to Event Service", error);
      }
  
      res.status(200).json({ message: "Video deleted successfully", gallery: userGallery });
  
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ error: "Failed to delete video" });
    }
  });
  
  
  // Function to delete video from GCP bucket
  async function deleteFromGCP(filePath) {
    try {
      await bucket.file(filePath).delete();
      // console.log(`Video deleted from GCP: ${filePath}`);
    } catch (error) {
      console.error("Error deleting from GCP:", error);
      throw error;
    }
  }
 
  module.exports = router;
  

































module.exports = router;
