// models/EventSchema.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: String,
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  gallery: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gallery'
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);