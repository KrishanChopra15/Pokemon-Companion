const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

/**
 * Authentication Routes
 */

// Register
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

module.exports = router;