import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AppAnnouncement, getPublishedAnnouncements, seedAnnouncementsIfEmpty } from '../utils/announcements';
import { fetchPublishedAnnouncements } from '../utils/announcementsApi';
import { getApiBase, getSocketUrl } from '../utils/apiBase';

export function useAnnouncements(limit?: number) {
  const [items, setItems] = useState<AppAnnouncement[]>([]);
  const [source, setSource] = useState<'api' | 'local'>('local');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const socketUrl = getSocketUrl();
    const pollMs = 20000;
    let pollTimer: any = null;
    let socket: any = null;

    const load = async (reason?: string) => {
      setLoading(true);
      setError('');
      const apiBase = getApiBase();
      if (!apiBase) seedAnnouncementsIfEmpty();

      try {
        const apiItems = await fetchPublishedAnnouncements();
        if (!cancelled) {
          setItems(limit ? apiItems.slice(0, limit) : apiItems);
          setSource('api');
        }
        return;
      } catch {
        if (apiBase) {
          if (!cancelled) {
            setItems([]);
            setSource('api');
            setError('Unable to load announcements from server.');
          }
          return;
        }
      } finally {
        if (!cancelled) setLoading(false);
      }

      const localItems = getPublishedAnnouncements();
      if (!cancelled) {
        setItems(limit ? localItems.slice(0, limit) : localItems);
        setSource('local');
      }
    };

    load('init');

    if (socketUrl) {
      socket = io(socketUrl, { withCredentials: true, transports: ['websocket', 'polling'] });
      socket.on('announcements.updated', () => load('socket'));
    } else {
      pollTimer = setInterval(() => load('poll'), pollMs);
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('lazyNotez.db.announcements')) {
        const localItems = getPublishedAnnouncements();
        setItems(limit ? localItems.slice(0, limit) : localItems);
        setSource('local');
      }
    };

    window.addEventListener('storage', onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', onStorage);
      if (pollTimer) clearInterval(pollTimer);
      if (socket) socket.disconnect();
    };
  }, [limit]);

  return { items, source, loading, error };
}
