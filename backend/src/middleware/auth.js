import asyncHandler from "express-async-handler";
import { verifyAccessToken } from "../utils/tokens.js";
import User from "../models/User.js";

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  const token = header.split(" ")[1];

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    res.status(401);
    throw new Error("Not authorized, user not found");
  }

  req.user = user;
  next();
});
