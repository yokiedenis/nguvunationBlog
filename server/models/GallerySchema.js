// models/GallerySchema.js
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  url: { type: String, required: true },
  thumbnail: String,
  size: { type: Number, required: true }, // in bytes
  duration: Number, // in seconds
  views: { type: Number, default: 0 },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // Reference to event
  createdAt: { type: Date, default: Date.now }
});

const gallerySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  freeStorage: { 
    type: Number, 
    default: 50 * 1024 * 1024 // 50MB in bytes
  },
  freeBandwidth: { 
    type: Number, 
    default: 100 * 1024 * 1024 // 100MB in bytes
  },
  videos: [videoSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gallery', gallerySchema);