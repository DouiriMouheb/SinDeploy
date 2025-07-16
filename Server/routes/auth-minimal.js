// Minimal auth routes for testing
const express = require("express");
const router = express.Router();

console.log('Creating minimal auth router...');

// Simple health check route
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

console.log('Minimal auth router created successfully');

module.exports = router;
