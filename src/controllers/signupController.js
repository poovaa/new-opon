// import Signup from "../models/Signup.js";
// import bcrypt from "bcryptjs";

// export const signup = async (req, res) => {
//   try {
//     const { username, email, number, password, confirmPassword } = req.body;

//     // Check required fields
//     if (!username || !email || !number || !password || !confirmPassword) {
//       return res.status(400).json({
//         message: "All fields are required"
//       });
//     }

//     // Check password match
//     if (password !== confirmPassword) {
//       return res.status(400).json({
//         message: "Passwords do not match"
//       });
//     }

//     // Check existing email
//     const existingUser = await Signup.findOne({ email });

//     if (existingUser) {
//       return res.status(409).json({
//         message: "Email already registered"
//       });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 12);

//     // Save user in MongoDB
//     const newUser = await Signup.create({
//       username,
//       email,
//       number,
//       password: hashedPassword
//     });

//     return res.status(201).json({
//       message: "Signup successful",
//       user: {
//         id: newUser._id,
//         username: newUser.username,
//         email: newUser.email,
//         number: newUser.number
//       }
//     });

//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(409).json({
//         message: "Email already registered"
//       });
//     }

//     console.error(error);
//     return res.status(500).json({
//       message: "Internal server error"
//     });
//   }
// };

import Signup from "../models/Signup.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const {
      fullname,
      username,
      email,
      number,
      password,
      confirmPassword
    } = req.body;

    if (
      !fullname ||
      !username ||
      !email ||
      !number ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    const existingUser = await Signup.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await Signup.create({
      fullname,
      username,
      email,
      number,
      password: hashedPassword
    });

    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: newUser._id,
        fullname: newUser.fullname,
        username: newUser.username,
        email: newUser.email,
        number: newUser.number
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};