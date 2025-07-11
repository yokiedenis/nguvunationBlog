const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique:true
  },
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
  }
});

const Storage = mongoose.model('Storage', usageSchema);

module.exports = {Storage};