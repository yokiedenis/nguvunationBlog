// routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/EventSchema');
const authenticate = require('../middleware/auth');

// Create a new event
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, startDate, endDate, location } = req.body;
    
    const newEvent = new Event({
      title,
      description,
      startDate,
      endDate,
      location,
      organizer: req.user.userId
    });
    
    await newEvent.save();
    
    res.status(201).json({
      message: 'Event created successfully',
      event: newEvent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name profileImg')
      .sort({ startDate: -1 });
      
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get event details
router.get('/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('organizer', 'name profileImg')
      .populate('participants', 'name profileImg');
      
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join an event
router.post('/:eventId/join', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Add user to participants if not already
    if (!event.participants.includes(req.user.userId)) {
      event.participants.push(req.user.userId);
      await event.save();
    }
    
    res.json({
      message: 'You have joined the event',
      event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;