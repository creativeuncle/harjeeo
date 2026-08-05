import webpush from "web-push";
import { env } from "../config/env.js";
import Notification from "../models/Notification.js";
import PushSubscription from "../models/PushSubscription.js";

let configured = false;
function ensureConfigured() {
  if (configured || !env.vapidPublicKey || !env.vapidPrivateKey) return;
  webpush.setVapidDetails(env.vapidSubject, env.vapidPublicKey, env.vapidPrivateKey);
  configured = true;
}

async function pushToUser(userId, payload) {
  ensureConfigured();
  if (!env.vapidPublicKey || !env.vapidPrivateKey) return;

  const subscriptions = await PushSubscription.find({ user: userId });
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify(payload)
        );
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    })
  );
}

// recipientIds: single id or array. actorId is excluded from recipients.
export async function notify({ recipientIds, actorId, workspace, type, title, body, link, meta }) {
  const ids = (Array.isArray(recipientIds) ? recipientIds : [recipientIds])
    .filter(Boolean)
    .map(String);
  const unique = [...new Set(ids)].filter((id) => id !== String(actorId));
  if (unique.length === 0) return;

  await Promise.all(
    unique.map(async (recipientId) => {
      await Notification.create({
        recipient: recipientId,
        actor: actorId || null,
        workspace,
        type,
        title,
        body,
        link,
        meta: meta ?? null,
      });
      await pushToUser(recipientId, { title, body, link });
    })
  );
}
