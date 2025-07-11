const mongoose = require('mongoose');

const storageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique:true
  },
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
  }
});

const Usage = mongoose.model('Usage', storageSchema);

module.exports = {Usage};