import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiry,
  });
}

export function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiry,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

export const REFRESH_COOKIE_NAME = "harjeeo_refresh";

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/api/auth",
  };
}
