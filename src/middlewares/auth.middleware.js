import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check if Authorization header exists
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        throw new ApiError(401, "Not authorized, token missing");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    req.user = user;
    next();
});

//Role-Based Access Control
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "Access denied: insufficient permissions");
    }
    next();
  };
};
