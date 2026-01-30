// models/EventSchema.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, default: "" },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  // Event gallery and video management
  gallery: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gallery",
    },
  ],
  eventGalleryStats: {
    totalVideos: {
      type: Number,
      default: 0,
    },
    totalViews: {
      type: Number,
      default: 0,
    },
    totalEngagement: {
      type: Number,
      default: 0,
    },
  },
  // Event categorization
  eventType: {
    type: String,
    enum: [
      "charity",
      "festival",
      "fundraiser",
      "conference",
      "workshop",
      "other",
    ],
    default: "other",
  },
  category: {
    type: String,
    default: "",
  },
  // Event settings
  allowVideoUpload: {
    type: Boolean,
    default: true,
  },
  videoUploadRestriction: {
    type: String,
    enum: ["all", "organizer", "participants"],
    default: "participants",
  },
  banner: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Event", eventSchema);
