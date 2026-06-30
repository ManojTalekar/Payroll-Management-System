const User = require("../models/User");
const Employee = require("../models/Employee");
const ActivityLog = require("../models/ActivityLog");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../services/emailService");
const { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} = require("../utils/tokenHelper");

// @desc    Authenticate user & get tokens
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.error("Authentication failed: Missing username or password in request body");
    return res.status(400).json({ success: false, message: "Please provide email/username and password" });
  }

  try {
    let user;
    // Check if logging in as default Admin
    if (username === "admin") {
      user = await User.findOne({ role: "admin" }).populate("employeeRef");
    } else {
      // Find by email or employee name (case-insensitive fallback matching the frontend)
      user = await User.findOne({ email: username.toLowerCase() }).populate("employeeRef");
      if (!user) {
        // Fallback: search Employee by name, get associated User
        const emp = await Employee.findOne({ name: { $regex: new RegExp(`^${username}$`, "i") } });
        if (emp) {
          user = await User.findOne({ employeeRef: emp._id }).populate("employeeRef");
        }
      }
    }

    if (!user) {
      console.error(`Authentication failed: User not found for username/email: "${username}"`);
      return res.status(401).json({ success: false, message: "Invalid Email or Secret Password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.error(`Authentication failed: Password mismatch for user: "${username}"`);
      return res.status(401).json({ success: false, message: "Invalid Email or Secret Password" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Log Activity
    await ActivityLog.create({
      user: user._id,
      action: "User logged in",
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
      userAgent: req.headers["user-agent"] || ""
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeRef ? user.employeeRef.employeeId : null,
        name: user.employeeRef ? user.employeeRef.name : "Administrator"
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refresh = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, message: "Refresh token required" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
};

// @desc    Forgot password request
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: "There is no user with that email" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes

    await user.save();

    // Log Activity
    await ActivityLog.create({
      user: user._id,
      action: `Forgot password requested. Reset Token: ${resetToken}`,
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || ""
    });

    // Send the actual email
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({
      success: true,
      message: "Email sent with reset instructions",
      resetToken // Returned directly for testing/demo purposes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.refreshToken = undefined;
    await user.save();

    // Log Activity
    await ActivityLog.create({
      user: user._id,
      action: "Password reset successful",
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || ""
    });

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password (authenticated)
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Please provide old and new passwords" });
  }

  try {
    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password" });
    }

    user.password = newPassword;
    await user.save();

    // Log Activity
    await ActivityLog.create({
      user: user._id,
      action: "Password changed successfully via Portal",
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || ""
    });

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system audit activity logs
// @route   GET /api/auth/activity-logs
// @access  Private/Admin
const getActivityLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find()
      .populate({
        path: "user",
        select: "email role",
        populate: { path: "employeeRef", select: "name employeeId" }
      })
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & invalidate refresh token
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    // Log Activity
    await ActivityLog.create({
      user: req.user.id,
      action: "User logged out",
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
      userAgent: req.headers["user-agent"] || ""
    });

    res.json({ success: true, message: "Successfully logged out" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  refresh,
  forgotPassword,
  resetPassword,
  changePassword,
  getActivityLogs,
  logout
};
