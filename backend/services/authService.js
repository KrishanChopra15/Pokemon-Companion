const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Register a new user
 */
const register = async ({ username, email, password }) => {
    // Check if email already exists
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
        throw new Error("Email already registered");
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
        throw new Error("Username already taken");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
        username,
        email,
        password: hashedPassword
    });

    // Generate JWT
    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            theme: user.theme
        },
        token
    };
};

/**
 * Login an existing user
 */
const login = async ({ email, password }) => {

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    // Generate JWT
    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

    return {
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            theme: user.theme
        },
        token
    };
};

module.exports = {
    register,
    login
};