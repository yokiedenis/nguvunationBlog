// configuring dotenv
require("dotenv").config({ path: "./.env" });
const express = require("express");
const app = express();
const http = require("http");
const connectDB = require("./utils/db_connect");
const cors = require("cors");
const cron = require("node-cron");
const bodyParser = require("body-parser");
const server = http.createServer(app);

// Import models
const { Query } = require("./models/QuerySchema");
const { Usage } = require("./models/UsageSchema");
const { Storage } = require("./models/StorageSchema");
const { Gallery } = require("./models/GallerySchema");
const Event = require("./models/EventSchema");
const Notification = require("./models/notification.model");
const axios = require("axios");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: [process.env.FRONTEND_CLIENT_URL],
  methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const session = require("express-session");
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  }),
);

const PORT = process.env.PORT || 5000;

// Import routes
const authenticationRouter = require("./routers/authentication.router");
const eventsRouter = require("./routers/events");
const blogRouter = require("./routers/blog.router");
const categoryRouter = require("./routers/category.router");
const contactRouter = require("./routers/contact.router");
const subscriptionRouter = require("./routers/subscription.router");
const commentRouter = require("./routers/comment.router");
const passwordRecoveryRouter = require("./routers/password.recovery.router");
const signAuthRouter = require("./routers/signauth.router");
const queries = require("./routers/queries");
const videos = require("./routers/videos");

// Routes
app.use("/auth", signAuthRouter);
app.use("/api", authenticationRouter);
app.use("/api", contactRouter);
app.use("/api", subscriptionRouter);
app.use("/blog", blogRouter);
app.use("/blog", categoryRouter);
app.use("/blog", commentRouter);
app.use("/password", passwordRecoveryRouter);
app.use("/events", eventsRouter);
app.use("/queries", queries);
app.use("/videos", videos);

// Event handlers
app.post("/queries/events", async (req, res) => {
  console.log("Event Received:", req.body.type);
  const { type, data } = req.body;

  if (type === "UserCreated") {
    try {
      const { userId, username, email } = data;
      const query = await Query.findOne({ userId });
      if (!query) {
        console.log(`Creating query for user: ${userId}`);
        const defaultQueryData = {
          userId: userId,
          username: username,
          email: email,
          gallery: {
            videos: [],
          },
          storage: {
            totalStorage: 50 * 1024 * 1024,
            UsedStorage: 0,
            FreeStorage: 50 * 1024 * 1024,
          },
          usage: {
            bandwidthTotalUsage: 0,
            bandwidthDailyUsage: 0,
            dailyLimit: 100 * 1024 * 1024,
          },
        };
        const newQuery = new Query(defaultQueryData);
        await newQuery.save();
        console.log(`Query created for user: ${userId}`);
      }
    } catch (error) {
      console.error("Error creating Query:", error);
      return res.status(500).json({ error: "Error creating Query" });
    }
  }

  if (type === "videosAdded") {
    try {
      const { userId, gallery } = data;
      const query = await Query.findOne({ userId });
      if (query) {
        query.gallery.videos = gallery.videos;
        await query.save();
        console.log("Updated Query for videosAdded event:", userId);
      }
    } catch (error) {
      console.error("Error handling videosAdded event:", error.message);
    }
  }

  if (type === "videoRemoved") {
    try {
      const { userId, gallery } = data;
      const query = await Query.findOne({ userId });
      if (query) {
        query.gallery.videos = gallery.videos;
        await query.save();
        console.log("Updated Query for videoRemoved event:", userId);
      }
    } catch (error) {
      console.error("Error handling videoRemoved event:", error.message);
    }
  }

  if (type === "StorageUpdated") {
    try {
      const { userId, storageDetails } = data;
      const query = await Query.findOne({ userId });
      if (query) {
        query.storage = {
          ...query.storage,
          ...storageDetails,
        };
        await query.save();
        console.log("Updated Query for StorageUpdated event:", userId);
      }
    } catch (error) {
      console.error("Error handling StorageUpdated event:", error.message);
    }
  }

  if (type === "UsageUpdated") {
    try {
      const { userId, usageDetails } = data;
      const query = await Query.findOne({ userId });
      if (query) {
        query.usage = {
          ...query.usage,
          ...usageDetails,
        };
        await query.save();
        console.log("Updated Query for UsageUpdated event:", userId);
      }
    } catch (error) {
      console.error("Error handling UsageUpdated event:", error.message);
    }
  }

  res.json({ success: true });
});

app.post("/storage/events", async (req, res) => {
  console.log("Event Received:", req.body.type);
  const { type, data } = req.body;

  if (type === "UserCreated") {
    try {
      const { userId } = data;
      const storage = await Storage.findOne({ userId });
      if (!storage) {
        const initialStorage = new Storage({
          userId,
          totalStorage: 50 * 1024 * 1024,
          UsedStorage: 0,
          FreeStorage: 50 * 1024 * 1024,
        });
        await initialStorage.save();
        console.log("Storage Added for user:", userId);
      }
    } catch (error) {
      console.error("Error handling UserCreated event:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (type === "videoRemoved") {
    try {
      const { userId, videoSize } = data;
      const storage = await Storage.findOne({ userId });

      if (!storage) {
        console.error("Storage not found for User:", userId);
        return res.status(404).json({ error: "Storage not found" });
      }

      storage.UsedStorage -= videoSize;
      storage.FreeStorage += videoSize;
      await storage.save();

      try {
        await axios.post(`${process.env.FRONTEND_CLIENT_URL}/queries/events`, {
          type: "StorageUpdated",
          data: {
            userId,
            storageDetails: {
              UsedStorage: storage.UsedStorage,
              FreeStorage: storage.FreeStorage,
              totalStorage: storage.totalStorage,
            },
          },
        });
      } catch (error) {
        console.log("Error notifying storage update:", error.message);
      }

      console.log("Storage updated for videoRemoved event:", userId);
    } catch (error) {
      console.error("Error handling videoRemoved event:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (type === "videosAdded") {
    try {
      const { userId, video } = data;
      const storage = await Storage.findOne({ userId });

      if (!storage) {
        console.error("Storage not found for User:", userId);
        return res.status(404).json({ error: "Storage not found" });
      }

      const totalAddedSize = video.size || 0;
      storage.UsedStorage += totalAddedSize;
      storage.FreeStorage -= totalAddedSize;
      await storage.save();

      try {
        await axios.post(`${process.env.FRONTEND_CLIENT_URL}/queries/events`, {
          type: "StorageUpdated",
          data: {
            userId,
            storageDetails: {
              UsedStorage: storage.UsedStorage,
              FreeStorage: storage.FreeStorage,
              totalStorage: storage.totalStorage,
            },
          },
        });
      } catch (error) {
        console.log("Error notifying storage update:", error.message);
      }

      console.log("Storage updated for videosAdded event:", userId);
    } catch (error) {
      console.error("Error handling videosAdded event:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.json({ success: true });
});

app.post("/usagemonitoring/events", async (req, res) => {
  console.log("Event Received:", req.body.type);
  const { type, data } = req.body;

  if (type === "UserCreated") {
    try {
      const { userId } = data;
      const usage = await Usage.findOne({ userId });
      if (!usage) {
        const initialUsage = new Usage({
          userId,
          bandwidthTotalUsage: 0,
          bandwidthDailyUsage: 0,
          dailyLimit: 100 * 1024 * 1024,
        });
        await initialUsage.save();
        console.log("Usage Added for user:", userId);
      }
    } catch (error) {
      console.error("Error handling UserCreated event:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (type === "videosAdded") {
    try {
      const { userId, video } = data;
      const usage = await Usage.findOne({ userId });

      if (!usage) {
        console.error("Usage not found for User:", userId);
        return res.status(404).json({ error: "Usage not found" });
      }

      const totalAddedSize = video.size || 0;
      usage.bandwidthTotalUsage += totalAddedSize;
      usage.bandwidthDailyUsage += totalAddedSize;
      await usage.save();

      try {
        await axios.post(`${process.env.FRONTEND_CLIENT_URL}/queries/events`, {
          type: "UsageUpdated",
          data: {
            userId,
            usageDetails: {
              bandwidthTotalUsage: usage.bandwidthTotalUsage,
              bandwidthDailyUsage: usage.bandwidthDailyUsage,
            },
          },
        });
      } catch (error) {
        console.log("Error notifying usage update:", error.message);
      }

      console.log("Usage updated for videosAdded event:", userId);
    } catch (error) {
      console.error("Error handling videosAdded event:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.json({ success: true });
});

app.post("/videos/events", async (req, res) => {
  console.log("Event Received:", req.body.type);
  const { type, data } = req.body;

  if (type === "UserCreated") {
    try {
      const { userId } = data;
      const existingGallery = await Gallery.findOne({ userId: userId });
      if (!existingGallery) {
        const newGallery = new Gallery({
          userId: userId,
          freeStorage: 50 * 1024 * 1024,
          freeBandwidth: 100 * 1024 * 1024,
          videos: [],
          eventGalleries: [],
        });
        await newGallery.save();
        console.log(`Gallery created for user ${userId}`);
      } else {
        console.log(`Gallery already exists for user ${userId}`);
      }
    } catch (error) {
      console.error("Error creating gallery:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (type === "EventCreated") {
    try {
      const { eventId, title, organizer } = data;
      const event = await Event.findById(eventId);
      if (event) {
        event.eventGalleryStats = {
          totalVideos: 0,
          totalViews: 0,
          totalEngagement: 0,
        };
        await event.save();
        console.log(`Event gallery stats initialized for event ${eventId}`);
      }
    } catch (error) {
      console.error("Error initializing event gallery stats:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (type === "StorageUpdated") {
    try {
      const { userId, storageDetails } = data;
      const existingGallery = await Gallery.findOne({ userId });

      if (!existingGallery) {
        console.log(`Gallery not found for user ${userId}`);
        return res.status(404).json({ error: "Gallery not found" });
      }

      existingGallery.freeStorage = storageDetails.FreeStorage;
      await existingGallery.save();
      console.log(`Free storage updated for user ${userId}`);
    } catch (error) {
      console.error("Error updating free storage:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (type === "UsageUpdated") {
    try {
      const { userId, usageDetails } = data;
      const existingGallery = await Gallery.findOne({ userId });

      if (!existingGallery) {
        console.log(`Gallery not found for user ${userId}`);
        return res.status(404).json({ error: "Gallery not found" });
      }

      existingGallery.freeBandwidth =
        100 * 1024 * 1024 - usageDetails.bandwidthDailyUsage;
      await existingGallery.save();
      console.log(`Free bandwidth updated for user ${userId}`);
    } catch (error) {
      console.error("Error updating free bandwidth:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // Event Video Handlers
  if (type === "eventVideoAdded") {
    try {
      const { userId, eventId, video } = data;
      const storage = await Storage.findOne({ userId });

      if (storage) {
        storage.UsedStorage += video.size || 0;
        storage.FreeStorage -= video.size || 0;
        await storage.save();
        console.log("Storage updated for eventVideoAdded:", userId);
      }

      // Update usage
      const usage = await Usage.findOne({ userId });
      if (usage) {
        usage.bandwidthTotalUsage += video.size || 0;
        usage.bandwidthDailyUsage += video.size || 0;
        await usage.save();
        console.log("Usage updated for eventVideoAdded:", userId);
      }

      // Update event stats
      const event = await Event.findById(eventId);
      if (event) {
        event.eventGalleryStats.totalVideos =
          (event.eventGalleryStats.totalVideos || 0) + 1;
        await event.save();
      }
    } catch (error) {
      console.error("Error handling eventVideoAdded:", error.message);
    }
  }

  if (type === "eventVideoRemoved") {
    try {
      const { userId, eventId, videoSize } = data;
      const storage = await Storage.findOne({ userId });

      if (storage) {
        storage.UsedStorage -= videoSize || 0;
        storage.FreeStorage += videoSize || 0;
        await storage.save();
        console.log("Storage updated for eventVideoRemoved:", userId);
      }

      // Update usage
      const usage = await Usage.findOne({ userId });
      if (usage) {
        usage.bandwidthTotalUsage -= videoSize || 0;
        if (usage.bandwidthDailyUsage > 0) {
          usage.bandwidthDailyUsage -= videoSize || 0;
        }
        await usage.save();
        console.log("Usage updated for eventVideoRemoved:", userId);
      }

      // Update event stats
      const event = await Event.findById(eventId);
      if (event && event.eventGalleryStats.totalVideos > 0) {
        event.eventGalleryStats.totalVideos -= 1;
        await event.save();
      }
    } catch (error) {
      console.error("Error handling eventVideoRemoved:", error.message);
    }
  }

  res.json({ success: true });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// Start server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running at PORT ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });
