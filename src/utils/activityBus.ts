import type { AppActivity } from './localDb';

type Listener = (activity: AppActivity) => void;

const listeners = new Set<Listener>();
const STORAGE_KEY = 'lazyNotez.activity.last.v1';
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('lazyNotez.activity') : null;

function safeParse(raw: string | null): AppActivity | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.activity as AppActivity;
  } catch {
    return null;
  }
}

export function publishActivity(activity: AppActivity) {
  listeners.forEach((fn) => fn(activity));

  if (channel) {
    channel.postMessage(activity);
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ activity, ts: Date.now() }));
  } catch {
    // ignore
  }
}

export function subscribeActivities(listener: Listener) {
  listeners.add(listener);

  let channelHandler: ((ev: MessageEvent) => void) | null = null;
  if (channel) {
    channelHandler = (ev: MessageEvent) => listener(ev.data as AppActivity);
    channel.addEventListener('message', channelHandler);
  }

  const storageHandler = (ev: StorageEvent) => {
    if (channel) return;
    if (ev.key !== STORAGE_KEY) return;
    const activity = safeParse(ev.newValue);
    if (activity) listener(activity);
  };
  window.addEventListener('storage', storageHandler);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', storageHandler);
    if (channel && channelHandler) channel.removeEventListener('message', channelHandler);
  };
}

