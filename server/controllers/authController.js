const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ─── Validation Helpers ───────────────────────────────────────────────────────

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone); // Indian mobile number

const isValidEmployeeId = (id) => /^[A-Z]{2,5}\d{3,6}$/.test(id); // e.g., NHAI001, NH12345

const isStrongPassword = (password) => {
  // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
};

const validHighways = [
  "NH-1", "NH-2", "NH-4", "NH-5", "NH-6", "NH-7", "NH-8",
  "NH-10", "NH-19", "NH-24", "NH-27", "NH-44", "NH-48",
  "NH-52", "NH-58", "NH-66", "NH-71", "NH-76", "NH-92",
  "NH-104", "NH-148", "Other"
];

const validRoles = ["staff", "admin"];

// ─── Generate JWT Token ───────────────────────────────────────────────────────

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// ─── Register ─────────────────────────────────────────────────────────────────

// @desc    Register new staff / admin
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, employeeId, email, password, confirmPassword, role, highway, phone } = req.body;

    let errors = {};

    // ── 1. Name Validation ──
    if (!name || name.trim() === "") {
      errors.name = "Full name is required";
    } else if (name.trim().length < 3) {
      errors.name = "Name must be at least 3 characters";
    } else if (name.trim().length > 50) {
      errors.name = "Name must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      errors.name = "Name must contain only alphabets and spaces";
    }

    // ── 2. Employee ID Validation ──
    if (!employeeId || employeeId.trim() === "") {
      errors.employeeId = "Employee ID is required";
    } else if (!isValidEmployeeId(employeeId.trim().toUpperCase())) {
      errors.employeeId =
        "Invalid Employee ID. Format: 2-5 uppercase letters + 3-6 digits. Example: NHAI001";
    }

    // ── 3. Email Validation ──
    if (!email || email.trim() === "") {
      errors.email = "Email address is required";
    } else if (!isValidEmail(email.trim())) {
      errors.email = "Please enter a valid email address (e.g. shivam@nhai.gov.in)";
    } else if (email.trim().length > 100) {
      errors.email = "Email must not exceed 100 characters";
    }

    // ── 4. Password Validation ──
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    } else if (!isStrongPassword(password)) {
      errors.password =
        "Password must have: 1 uppercase letter, 1 lowercase letter, 1 number & 1 special character (@$!%*?&)";
    }

    // ── 5. Confirm Password Validation ──
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match. Please re-enter.";
    }

    // ── 6. Role Validation ──
    if (!role || role.trim() === "") {
      errors.role = "Role is required";
    } else if (!validRoles.includes(role)) {
      errors.role = `Role must be either: ${validRoles.join(" or ")}`;
    }

    // ── 7. Highway Validation ──
    if (!highway || highway.trim() === "") {
      errors.highway = "Highway assignment is required";
    } else if (!validHighways.includes(highway.trim())) {
      errors.highway = `Invalid highway. Valid options: ${validHighways.join(", ")}`;
    }

    // ── 8. Phone Validation ──
    if (!phone || phone.trim() === "") {
      errors.phone = "Phone number is required";
    } else if (!isValidPhone(phone.trim())) {
      errors.phone =
        "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9";
    }

    // ── Return ALL errors at once ──
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed. Please fix the errors below.",
        errors,
      });
    }

    // ── 9. Check duplicate Employee ID ──
    const existingEmployeeId = await User.findOne({
      employeeId: employeeId.trim().toUpperCase(),
    });
    if (existingEmployeeId) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: { employeeId: "This Employee ID is already registered" },
      });
    }

    // ── 10. Check duplicate Email ──
    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: { email: "This email address is already registered" },
      });
    }

    // ── 11. Check duplicate Phone ──
    const existingPhone = await User.findOne({ phone: phone.trim() });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: { phone: "This phone number is already registered" },
      });
    }

    // ── Create User ──
    const user = await User.create({
      name: name.trim(),
      employeeId: employeeId.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      password,
      role,
      highway: highway.trim(),
      phone: phone.trim(),
    });

    res.status(201).json({
      success: true,
      message: `${role === "admin" ? "Admin" : "Staff"} registered successfully! Welcome, ${user.name}.`,
      data: {
        _id: user._id,
        name: user.name,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        highway: user.highway,
        phone: user.phone,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

// @desc    Login user (via Employee ID + Password)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    let errors = {};

    // ── Validation ──
    if (!employeeId || employeeId.trim() === "") {
      errors.employeeId = "Employee ID is required";
    } else if (!isValidEmployeeId(employeeId.trim().toUpperCase())) {
      errors.employeeId = "Invalid Employee ID format. Example: NHAI001";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // ── Find user by Employee ID ──
    const user = await User.findOne({ employeeId: employeeId.trim().toUpperCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Employee ID or password",
      });
    }

    // ── Check if account is active ──
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated. Please contact your admin.",
      });
    }

    // ── Check password ──
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Employee ID or password",
      });
    }

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: {
        _id: user._id,
        name: user.name,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        highway: user.highway,
        phone: user.phone,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

// ─── Get Profile ──────────────────────────────────────────────────────────────

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

module.exports = { register, login, getMe };