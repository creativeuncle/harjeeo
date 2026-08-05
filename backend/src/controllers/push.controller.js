import asyncHandler from "express-async-handler";
import { env } from "../config/env.js";
import PushSubscription from "../models/PushSubscription.js";

export const getVapidPublicKey = asyncHandler(async (req, res) => {
  res.json({ publicKey: env.vapidPublicKey || null });
});

export const subscribe = asyncHandler(async (req, res) => {
  const { endpoint, keys } = req.body || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    res.status(400);
    throw new Error("A valid push subscription is required");
  }

  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { user: req.user._id, endpoint, keys },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ ok: true });
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const { endpoint } = req.body || {};
  if (!endpoint) {
    res.status(400);
    throw new Error("endpoint is required");
  }
  await PushSubscription.deleteOne({ endpoint, user: req.user._id });
  res.json({ ok: true });
});
