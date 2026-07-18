const authService = require("../services/authService");

/**
 * Register a new user
 */
const register = async (req, res) => {
    try {
        const result = await authService.register(req.body);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Login an existing user
 */
const login = async (req, res) => {
    try {
        const result = await authService.login(req.body);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * Get current logged-in user
 */
const getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        data: req.user
    });
};

module.exports = {
    register,
    login,
    getMe
};