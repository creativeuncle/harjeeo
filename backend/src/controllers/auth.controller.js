import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} from "../utils/tokens.js";

function issueTokens(res, userId) {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  return accessToken;
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }
  if (password.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({ name, email, password });
  const accessToken = issueTokens(res, user._id.toString());

  res.status(201).json({ user: user.toSafeObject(), accessToken });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const accessToken = issueTokens(res, user._id.toString());
  res.json({ user: user.toSafeObject(), accessToken });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    res.status(401);
    throw new Error("No refresh token provided");
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    res.status(401);
    throw new Error("Refresh token invalid or expired");
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const accessToken = issueTokens(res, user._id.toString());
  res.json({ user: user.toSafeObject(), accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
  res.status(204).send();
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});
