
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// STUDENT REGISTRATION
const registerStudent = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      collegeName,
      department,
      academicYear,
      rollNumber,
      address
    } = req.body;

    // Check required fields
    if (
      !fullName || !email || !password || !phone ||
      !dateOfBirth || !gender || !collegeName ||
      !department || !academicYear || !rollNumber || !address
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields"
      });
    }

    // Check password length
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters"
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({
      email: email.toLowerCase()
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create student
    const student = await Student.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      dateOfBirth,
      gender,
      collegeName,
      department,
      academicYear,
      rollNumber,
      address
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Student registered successfully",
      token,
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        department: student.department,
        academicYear: student.academicYear
      }
    });

  } catch (error) {
    console.error("Registration Error:", error);

    res.status(500).json({
      message: "Registration failed",
      error: error.code === 11000
        ? "Email or another unique field already exists"
        : "Internal server error"
    });
  }
};


// STUDENT LOGIN
const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find student
    const student = await Student.findOne({
      email: email.toLowerCase()
    });

    if (!student) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      student.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        department: student.department,
        academicYear: student.academicYear
      }
    });

  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      message: "Login failed",
      error: "Internal server error"
    });
  }
};

module.exports = {
  registerStudent,
  loginStudent
};
