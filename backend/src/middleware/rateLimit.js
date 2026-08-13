import rateLimit from "express-rate-limit";

// Applied to auth endpoints that are attractive brute-force/abuse targets
// (login, register, password reset). Keyed by IP; generous enough for a
// real user retrying a typo, tight enough to blunt automated guessing.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});
