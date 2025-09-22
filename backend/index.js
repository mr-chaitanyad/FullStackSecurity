require("dotenv").config();  // ✅ Load .env first
const express = require('express');
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authenticateToken = require('./middleware/authMiddleware');
const authorizeRole = require('./middleware/authorizeRole');

// ✅ Use environment variables
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || "ABCD@1234";
const MONGO_URI = process.env.MONGO_URI;

// ✅ Connect to MongoDB Atlas
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ User Schema & Model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  hashedPass: String,
  role: { type: String, default: "user" },
  lastLogin: String
});

const User = mongoose.model("User", userSchema);

// ✅ Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered", status: false });
    }

    const saltRounds = 10;
    const hashedPass = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      email,
      hashedPass,
      role: role || "user"
    });

    await newUser.save();
    res.status(201).json({ message: "User created", status: true });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials", status: false });
    }

    const isMatch = await bcrypt.compare(password, user.hashedPass);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials", status: false });
    }

    // Update last login time
    user.lastLogin = new Date().toISOString();
    await user.save();

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: "1d" });

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      lastLogin: user.lastLogin,
      status: true
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DASHBOARD
app.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not exists" });
    }
    res.json({ message: "Welcome to dashboard", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ ADMIN DASHBOARD
app.get("/adminDashboard", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      admin: req.user,
      users
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
