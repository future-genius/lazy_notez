import { useEffect, useState } from 'react';
import { AppAnnouncement, getPublishedAnnouncements, seedAnnouncementsIfEmpty } from '../utils/announcements';
import { fetchPublishedAnnouncements } from '../utils/announcementsApi';

export function useAnnouncements(limit?: number) {
  const [items, setItems] = useState<AppAnnouncement[]>([]);
  const [source, setSource] = useState<'api' | 'local'>('local');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      seedAnnouncementsIfEmpty();

      try {
        const apiItems = await fetchPublishedAnnouncements();
        if (!cancelled && apiItems.length > 0) {
          setItems(limit ? apiItems.slice(0, limit) : apiItems);
          setSource('api');
          return;
        }
      } catch {
        // fall back to local
      } finally {
        if (!cancelled) setLoading(false);
      }

      const localItems = getPublishedAnnouncements();
      if (!cancelled) {
        setItems(limit ? localItems.slice(0, limit) : localItems);
        setSource('local');
      }
    };

    load();

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
    };
  }, [limit]);

  return { items, source, loading };
}

