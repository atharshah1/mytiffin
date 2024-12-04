import { User } from '../models/userModel.js';
import { generateToken } from '../../utils/jwtUtils.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../../utils/AppError.js';

// Register a new user
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('User already exists', 400));
    }

    // Create new user
    const newUser = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        token: generateToken(newUser._id),
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
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get user profile (protected)
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({
        success: true,
        data: user,
      });
    } else {
      return next(new AppError('User not found', 404));
    }
  } catch (err) {
    next(err);
  }
};