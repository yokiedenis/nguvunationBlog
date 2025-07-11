const mongoose = require('mongoose');

const QuerySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gallery: {
    videos: [
      {
        title: {
          type: String,
          required: true,
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
      },
    ],
  },
  storage: {
    totalStorage: {
      type: Number,
      required: true,
    },
    UsedStorage: {
      type: Number,
      required: true,
    },
    FreeStorage: {
      type: Number,
      required: true,
    },
  },
  usage: {
    bandwidthTotalUsage: {
      type: Number,
      required: true,
    },
    bandwidthDailyUsage: {
      type: Number,
      required: true,
    },
    dailyLimit: {
      type: Number,
      required: true,
    },
  },
});

const Query = mongoose.model('Query', QuerySchema);

module.exports = {Query};