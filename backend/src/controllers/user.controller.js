import asyncHandler from "express-async-handler";

const ALLOWED_FIELDS = ["name", "avatarUrl", "language"];

export const updateMe = asyncHandler(async (req, res) => {
  for (const field of ALLOWED_FIELDS) {
    if (field in req.body) req.user[field] = req.body[field];
  }
  await req.user.save();
  res.json({ user: req.user.toSafeObject() });
});
