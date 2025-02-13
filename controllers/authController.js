import { body, validationResult } from "express-validator";
import bcryptjs from "bcryptjs";
import User from "../models/User.js";
import generateTokenAndSetCookie from "../Utils/generateToken.js";

// Registration Validation and Logic
export const register = async (req, res) => {
  try {
    await body("username")
      .isLength({ min: 3 })
      .trim()
      .escape()
      .withMessage("Username must be at least 3 characters long")
      .run(req);
    await body("fullName")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Full name is required")
      .run(req);
    await body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .run(req);
    await body("password")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .run(req); // Password strength check
    await body("password")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .run(req); // Password strength check
    await body("password")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .run(req); // Password strength check
    await body("password")
      .matches(/[@$!%*?&]/)
      .withMessage("Password must contain at least one special character")
      .run(req); // Password strength check
    await body("dateOfBirth")
      .isDate()
      .withMessage("Please provide a valid Date of Birth")
      .run(req);
    await body("gender")
      .isIn(["Male", "Female", "Other"])
      .withMessage("Gender must be one of 'Male', 'Female', or 'Other'")
      .run(req);
    await body("country")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Country is required")
      .run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, fullName, password, dateOfBirth, gender, country } =
      req.body;

    // Check if username already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      fullName,
      gender,
      dateOfBirth,
      country,
    });

    await newUser.save();
    generateTokenAndSetCookie(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      dateOfBirth: newUser.dateOfBirth,
      gender: newUser.gender,
      country: newUser.country,
    });
  } catch (error) {
    console.log("Error in register controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login Validation and Logic
export const login = async (req, res) => {
  try {
    await body("username")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Username is required")
      .run(req); // Validate username
    await body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .run(req); // Validate password length

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      country: user.country,
    });
  } catch (error) {
    console.log("Error in login controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
