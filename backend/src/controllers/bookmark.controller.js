import asyncHandler from "express-async-handler";
import Bookmark from "../models/Bookmark.js";
import { requireMembership } from "../utils/workspaceAuth.js";

function faviconFor(url) {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return null;
  }
}

function guessTitle(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export const listBookmarks = asyncHandler(async (req, res) => {
  await requireMembership(res, req.query.workspaceId, req.user._id);
  const bookmarks = await Bookmark.find({
    workspace: req.query.workspaceId,
    owner: req.user._id,
  }).sort({ createdAt: -1 });
  res.json({ bookmarks });
});

export const createBookmark = asyncHandler(async (req, res) => {
  const { workspaceId, url, title, tags } = req.body;
  if (!url || !url.trim()) {
    res.status(400);
    throw new Error("A URL is required");
  }
  await requireMembership(res, workspaceId, req.user._id);

  const bookmark = await Bookmark.create({
    owner: req.user._id,
    workspace: workspaceId,
    url: url.trim(),
    title: title?.trim() || guessTitle(url.trim()),
    tags: (tags ?? []).map((t) => t.trim()).filter(Boolean),
  });
  res.status(201).json({ bookmark: { ...bookmark.toObject(), favicon: faviconFor(bookmark.url) } });
});

async function findOwned(req, res) {
  const bookmark = await Bookmark.findById(req.params.id);
  if (!bookmark) {
    res.status(404);
    throw new Error("Bookmark not found");
  }
  if (String(bookmark.owner) !== String(req.user._id)) {
    res.status(403);
    throw new Error("This bookmark belongs to another user");
  }
  return bookmark;
}

export const updateBookmark = asyncHandler(async (req, res) => {
  const bookmark = await findOwned(req, res);
  const { title, notes, tags, read } = req.body;
  if (title !== undefined) bookmark.title = title;
  if (notes !== undefined) bookmark.notes = notes;
  if (tags !== undefined) bookmark.tags = tags.map((t) => t.trim()).filter(Boolean);
  if (read !== undefined) bookmark.read = Boolean(read);
  await bookmark.save();
  res.json({ bookmark });
});

export const deleteBookmark = asyncHandler(async (req, res) => {
  const bookmark = await findOwned(req, res);
  await bookmark.deleteOne();
  res.status(204).end();
});
