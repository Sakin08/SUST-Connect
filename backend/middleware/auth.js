import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;
  let isAccessToken = false;

  // PRIORITY 1: Check Authorization header (works on all devices including iOS)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
    isAccessToken = true;
  }
  // PRIORITY 2: Fallback to refresh token in cookies (may not work on iOS Safari)
  else if (req.cookies?.refreshToken) {
    token = req.cookies.refreshToken;
    isAccessToken = false;
  }

  if (!token) {
    console.log("Auth failed - No token found in headers or cookies");
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // Use appropriate secret based on token type
    const secret = isAccessToken
      ? process.env.JWT_ACCESS_SECRET
      : process.env.JWT_REFRESH_SECRET;
    const decoded = jwt.verify(token, secret);
    req.user = await User.findById(decoded.id).select("-password");

    // Check if user is banned
    if (req.user.isBanned) {
      return res.status(403).json({
        message: req.user.banReason
          ? `Your account has been banned. Reason: ${req.user.banReason}`
          : "Your account has been banned. Please contact support.",
        banned: true,
      });
    }

    // Check if user is approved (admins are always allowed)
    if (!req.user.isApproved && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Your account is pending admin approval",
        requiresApproval: true,
      });
    }

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin only." });
  }
};
