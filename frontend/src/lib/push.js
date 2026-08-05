import { api } from "./api";

const AUTO_PROMPT_KEY = "harjeeo_push_prompted";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

async function ensureServiceWorkerRegistered() {
  const existing = await navigator.serviceWorker.getRegistration();
  return existing ?? navigator.serviceWorker.register("/service-worker.js");
}

export async function getExistingSubscription() {
  if (!isPushSupported()) return null;
  const registration = await ensureServiceWorkerRegistered();
  return registration.pushManager.getSubscription();
}

export async function subscribeToPush() {
  if (!isPushSupported()) throw new Error("Push notifications are not supported here");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission was not granted");

  const registration = await ensureServiceWorkerRegistered();
  await navigator.serviceWorker.ready;

  const { data } = await api.get("/push/vapid-public-key");
  if (!data.publicKey) throw new Error("Push is not configured on the server");

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    });
  }

  await api.post("/push/subscribe", subscription.toJSON());
  return subscription;
}

export async function unsubscribeFromPush() {
  const subscription = await getExistingSubscription();
  if (!subscription) return;
  await api.post("/push/unsubscribe", { endpoint: subscription.endpoint });
  await subscription.unsubscribe();
}

// Silently asks for push permission once per browser, right after the user
// first lands in the authenticated app (post-login/signup). Never re-prompts
// after that — the bell's "Enable push notifications" button covers retries.
export async function maybeAutoPromptForPush() {
  if (!isPushSupported()) return;
  if (localStorage.getItem(AUTO_PROMPT_KEY)) return;
  if (Notification.permission !== "default") return;

  localStorage.setItem(AUTO_PROMPT_KEY, "1");
  try {
    await subscribeToPush();
  } catch {
    // User dismissed or denied — the manual button remains available.
  }
}
