import { body, validationResult } from "express-validator";
import bcryptjs from "bcryptjs";
import User from "../models/User.js";
import generateTokenAndSetCookie from "../Utils/generateToken.js";

// Custom Password Validator Function
const passwordValidation = () => {
  return body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain at least one special character");
};

// Grouped Registration Validation
const registerValidation = [
  body("username")
    .isLength({ min: 3 })
    .trim()
    .escape()
    .withMessage("Username must be at least 3 characters long"),
  body("fullName")
    .notEmpty()
    .trim()
    .escape()
    .withMessage("Full name is required"),
  passwordValidation(),
  body("dateOfBirth")
    .isDate()
    .withMessage("Please provide a valid Date of Birth"),
  body("gender")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be one of 'Male', 'Female', or 'Other'"),
  body("country").notEmpty().trim().escape().withMessage("Country is required"),
];

// Grouped Login Validation
const loginValidation = [
  body("username")
    .notEmpty()
    .trim()
    .escape()
    .withMessage("Username is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Register Route Logic
export const register = async (req, res) => {
  try {
    // Run Validation
    await Promise.all(
      registerValidation.map((validation) => validation.run(req))
    );
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

//kdwnoidwdowdodw

// Login Route Logic
export const login = async (req, res) => {
  try {
    // Run Validation
    await Promise.all(loginValidation.map((validation) => validation.run(req)));
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
