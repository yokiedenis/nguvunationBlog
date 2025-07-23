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
  // FIXED: Removed duplicate Query import
  const { Query } = require("./models/QuerySchema");
  const { Usage } = require("./models/UsageSchema");
  const { Storage } = require("./models/StorageSchema");
  const { Gallery } = require("./models/GallerySchema");
  const mongoose = require("./config/db");
  // FIXED: Removed duplicate queries route import
  const queries = require("./routers/queries");
  const axios = require("axios"); // Added missing axios import

  // Middleware
  app.use(express.json());
  app.use(cors());
  const corsOptions = {
    origin: [process.env.FRONTEND_CLIENT_URL],
    methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  const session = require("express-session");
  app.use(
    session({
      secret: process.env.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 24 * 60 * 60 * 1000 },
    })
  );

  const PORT = process.env.PORT || 5000;

  // Import routes
  const authenticationRouter = require("./routers/authentication.router");
  const eventsRouter = require('./routers/events');
  const blogRouter = require("./routers/blog.router");
  const categoryRouter = require("./routers/category.router");
  const contactRouter = require("./routers/contact.router");
  const subscriptionRouter = require("./routers/subscription.router");
  const commentRouter = require("./routers/comment.router");
  const passwordRecoveryRouter = require("./routers/password.recovery.router");
  const signAuthRouter = require("./routers/signauth.router");
  // const { initializeSocket } = require("./socket");
  const Notification = require("./models/notification.model");

  // Routes
  app.use("/auth", signAuthRouter);
  app.use("/api", authenticationRouter);
  app.use("/api", contactRouter);
  app.use("/api", subscriptionRouter);
  app.use("/blog", blogRouter);
  app.use("/blog", categoryRouter);
  app.use("/blog", commentRouter);
  app.use("/password", passwordRecoveryRouter);
  app.use('/events', eventsRouter);
  app.use("/queries", queries);
  // Initialize Socket.IO
  // initializeSocket(server);

  app.post("/queries/events", async (req, res) => {
    console.log("Event Received:", req.body.type);
    const { type, data } = req.body;
    if (type === "UserCreated") {
      try {
        const { userId, username, email } = data;
        const query = await Query.findOne({ userId });
        if (!query) {
          console.log(`user id in query${userId}`)
          const defaultQueryData = {
            userId: userId,
            username: username,
            email: email,
            gallery: {
              videos: [],
            },
            storage: {
              totalStorage: 50*1024*1024,
              UsedStorage: 0,
              FreeStorage: 50*1024*1024,
            },
            usage: {
              bandwidthTotalUsage: 0,
              bandwidthDailyUsage: 0,
              dailyLimit: 100*1024*1024,
            },
          };
          const newQuery = new Query(defaultQueryData);
          await newQuery.save();
          console.log(`Query created for user: ${data.userId}`);
        }
      } catch (error) {
        console.error("Error creating Query:", error);
        res.status(500).send("Error creating Query");
      }
    }
    if (type === "videosAdded") {
      try {
        const { userId, videosEv, gallery } = data;
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
        const { userId, videoId, videoSize, gallery } = data;
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
    res.send({});
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
            totalStorage: 50*1024*1024,
            UsedStorage: 0,
            FreeStorage: 50*1024*1024,
          });

          await initialStorage.save();
          console.log("storage Added");
        }
      } catch (error) {
        console.error("Error handling UserCreated event:", error.message);
      }
    }

    if (type === "videoRemoved") {
      try {
        const { userId, videoId, videoSize } = data;
        const storage = await Storage.findOne({ userId });

        if (!storage) {
          console.error("Storage not found for User:", userId);
          return res.status(404).send("Storage not found");
        }

        storage.UsedStorage -= videoSize;
        storage.FreeStorage += videoSize;

        await storage.save();
        try{
          await axios.post(`${process.env.FRONTEND_CLIENT_URL}/events`, {
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
        }catch(error){
          console.log(error)
        }
        console.log("Storage updated for videoRemoved event:", userId);
      } catch (error) {
        console.error("Error handling videoRemoved event:", error.message);
      }
    }

    if (type === "videosAdded") {
      try {
        const { userId, video } = data;
        const storage = await Storage.findOne({ userId });

        if (!storage) {
          console.error("Storage not found for User:", userId);
          return res.status(404).send("Storage not found");
        }
        const totalAddedSize = video.size;
        console.log(totalAddedSize)
        storage.UsedStorage += totalAddedSize;
        storage.FreeStorage -= totalAddedSize;

        await storage.save();
        try{
          await axios.post(`${process.env.FRONTEND_CLIENT_URL}/events`, {
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
        }catch(error){
          console.log(error)
        }
        console.log("Storage updated for videosAdded event:", userId);
      } catch (error) {
        console.error("Error handling videosAdded event:", error.message);
      }
    }

    res.send({});
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
            dailyLimit:100*1024*1024,
          });
          await initialUsage.save();
          console.log("Usage Added")
        }
      } catch (error) {
        console.error("Error handling UserCreated event:", error.message);
      }
    }
    if (type === "videosAdded") {
      try {
        const { userId, video } = data;
        const usage = await Usage.findOne({ userId });

        if (!usage) {
          console.error("Usage not found for User:", userId);
          return res.status(404).send("Usage not found");
        }

        const totalAddedSize = video.size

        usage.bandwidthTotalUsage += totalAddedSize;
        usage.bandwidthDailyUsage += totalAddedSize;

        await usage.save();
        console.log("Usage updated for videosAdded event:", userId);

        try {
          await axios.post(`${process.env.FRONTEND_CLIENT_URL}/events`, {
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
          console.log(error);
        }
      } catch (error) {
        console.error("Error handling videosAdded event:", error.message);
        return res.status(500).send("Internal Server Error");
      }
    }
    res.send({});
  });

  const videos = require("./routers/videos");
  app.use("/videos", videos);

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
            freeStorage: (50*1024*1024),
            freeBandwidth: (100*1024*1024),
            videos: [],
          });
          await newGallery.save();
          console.log(`Gallery created for user ${data.userId}`);
        } else {
          console.log(`Gallery already exists for user ${data.userId}`);
        }
      } catch (error) {
        console.error("Error creating gallery:", error);
        return res.status(500).send("Internal Server Error");
      }
    }
    if (type === "StorageUpdated") {
      try {
        const { userId, storageDetails } = data;
        const existingGallery = await Gallery.findOne({ userId });

        if (!existingGallery) {
          console.log(`Gallery not found for user ${userId}`);
          return res.status(404).send("Gallery not found");
        }

        existingGallery.freeStorage = storageDetails.FreeStorage;

        await existingGallery.save();
        console.log(`Free storage updated for user ${userId}`);
      } catch (error) {
        console.error("Error updating free storage:", error.message);
        return res.status(500).send("Internal Server Error");
      }
    }
    if (type === "UsageUpdated") {
      try {
        const { userId, usageDetails } = data;
        const existingGallery = await Gallery.findOne({ userId });

        if (!existingGallery) {
          console.log(`Gallery not found for user ${userId}`);
          return res.status(404).send("Gallery not found");
        }

        existingGallery.freeBandwidth = (100*1024*1024) - usageDetails.bandwidthDailyUsage;

        await existingGallery.save();
        console.log(`Free bandwidth updated for user ${userId}`);
      } catch (error) {
        console.error(
          "Error updating free bandwidth based on usage:",
          error.message
        );
        return res.status(500).send("Internal Server Error");
      }
    }
    res.send({});
  });

  // Start server
  connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running at PORT ${PORT}`);
    });
  });