const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
/**
 * Authentication Routes
 */

// Register
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

// Current logged-in user
router.get("/me", protect, authController.getMe);

module.exports = router;