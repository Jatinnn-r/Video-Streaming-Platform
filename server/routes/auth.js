// server/routes/auth.js
const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    // 1. Destructure data from request
    const { username, email, password, role } = req.body;

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // 3. Hash the password (Security)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create and Save new User
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'viewer' // Default to viewer if no role provided
    });

    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});
// LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
      // 1. Find user by email
      const user = await User.findOne({ email: req.body.email });
      if (!user) return res.status(404).json("User not found");
  
      // 2. Compare the password (user input vs encrypted DB password)
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) return res.status(400).json("Wrong password");
  
      // 3. Create Access Token (The "ID Card")
      // Note: We use a fallback secret 'mySecretKey' if .env fails
      const token = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.jwt_secret || 'mySecretKey', 
        { expiresIn: "5d" }
      );
  
      // 4. Send back user info + Token
      const { password, ...others } = user._doc; // Remove password from response
      res.status(200).json({ ...others, token });
    } catch (err) {
      res.status(500).json(err);
    }
  });

module.exports = router;