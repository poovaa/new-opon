import Signup from "../models/Signup.js";
import bcrypt from "bcryptjs";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find registered user
    const user = await Signup.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Compare entered password with hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Login successful
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        number: user.number
      }
    });

  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};