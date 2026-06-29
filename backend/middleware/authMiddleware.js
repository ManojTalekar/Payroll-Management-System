const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized to access this route" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretjwtkeyforhrms123!");
    req.user = await User.findById(decoded.id).select("-password").populate("employeeRef");
    if (!req.user) {
      console.error("JWT Auth error: User no longer exists");
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }
    next();
  } catch (error) {
    console.error("JWT error:", error.message);
    return res.status(401).json({ success: false, message: `JWT error: ${error.message}` });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : "none"}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
