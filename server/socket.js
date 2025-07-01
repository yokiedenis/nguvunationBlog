const socketIO = require("socket.io");
let io;
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://nguvunationblog.onrender.com"]
    : ["http://localhost:5173"];

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: allowedOrigins,// Adjust if using a different frontend port
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("join_room", (userId) => {
      socket.join(userId); // Join the room corresponding to the userId
      console.log(`User with ID ${userId} joined room ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

// Function to send real-time notifications
const sendRealTimeNotification = (userId, notification) => {
  if (!io) throw new Error("Socket.IO is not initialized");
  io.to(userId.toString()).emit("new_notification", notification);
};

const deleteRealTimeNotification = (userId, notificationId) => {
  if (!io) throw new Error("Socket.IO is not initialized");
  io.to(userId.toString()).emit("remove_notification", { notificationId });
};

module.exports = {
  initializeSocket,
  sendRealTimeNotification,
  deleteRealTimeNotification,
};
