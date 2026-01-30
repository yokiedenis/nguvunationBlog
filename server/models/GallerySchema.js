const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  size: {
    type: Number,
    required: true,
  },
  videoLink: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  // Event-specific metadata
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    default: null,
  },
  videoCreator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: String,
    enum: [
      "fundraiser",
      "performance",
      "testimonial",
      "behind-the-scenes",
      "announcement",
      "other",
    ],
    default: "other",
  },
  visibility: {
    type: String,
    enum: ["public", "private", "membersOnly"],
    default: "public",
  },
  thumbnail: {
    type: String,
    default: null,
  },
  duration: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const gallerySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  freeStorage: {
    type: Number,
    required: true,
  },
  freeBandwidth: {
    type: Number,
    required: true,
  },
  videos: [videoSchema],
  // Event-specific gallery fields
  eventGalleries: [
    {
      eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
      },
      totalVideos: {
        type: Number,
        default: 0,
      },
      totalEngagement: {
        views: {
          type: Number,
          default: 0,
        },
        likes: {
          type: Number,
          default: 0,
        },
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Gallery = mongoose.model("Gallery", gallerySchema);

module.exports = { Gallery };
