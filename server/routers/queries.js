const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Query } = require("../models/QuerySchema");


function verifyToken(req, res, next) {
  const token = req.header("Authorization");
  console.log(token);
  if (!token)
    return res.status(401).json({ message: "Authorization token missing" });


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

//verifyToken,
router.get("/:userId",verifyToken,  async (req, res) => {
  console.log(req);
  try {
        const userId = req.params.userId;
    
        const userData = await Query.findOne({ userId });
    
        if (!userData) {
          return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ userData });
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: "Failed to fetch user data" });
      }
});
  


module.exports = router;