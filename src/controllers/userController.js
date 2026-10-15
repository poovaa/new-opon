
import User from "../models/User.js";

// Create a new user
export const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      message: "User created successfully",
      data: user
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      data: users
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
