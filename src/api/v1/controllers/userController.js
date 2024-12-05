import prisma from "../../../config/db.js";
import { generateToken } from "../../../utils/jwtUtils.js";
import bcrypt from "bcryptjs";
import { AppError } from "../../../utils/AppError.js";

// Register a new user
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return next(new AppError("User already exists", 400));
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        _id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        token: generateToken(newUser.id),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Authenticate user and get token
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError("Invalid email or password", 401));
    }

    res.json({
      success: true,
      data: {
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get user profile (protected)
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });
    if (user) {
      res.json({
        success: true,
        data: {
          _id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } else {
      return next(new AppError("User not found", 404));
    }
  } catch (err) {
    next(err);
  }
};
