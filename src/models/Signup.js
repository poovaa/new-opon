import mongoose from "mongoose";

const signupSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
    fullname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  number: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Signup = mongoose.model("Signup", signupSchema);

export default Signup;