import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { getResources, seedResourcesIfEmpty, type AppResource } from '../utils/localDb';
import { getSocketUrl, getApiBase } from '../utils/apiBase';
import { fetchResources } from '../utils/resourcesApi';

export function useResources() {
  const apiBase = getApiBase();
  const socketUrl = getSocketUrl();

  const [items, setItems] = useState<AppResource[]>(() => getResources());
  const [source, setSource] = useState<'api' | 'local'>(apiBase ? 'api' : 'local');
  const [loading, setLoading] = useState(true);

  const refresh = useMemo(() => {
    return async () => {
      setLoading(true);
      if (!apiBase) seedResourcesIfEmpty();

      if (apiBase) {
        try {
          const remote = await fetchResources({ limit: 500 });
          setItems(remote);
          setSource('api');
          setLoading(false);
          return;
        } catch {
          // ignore
        }
      }

      setItems(getResources());
      setSource('local');
      setLoading(false);
    };
  }, [apiBase]);

  useEffect(() => {
    let cancelled = false;
    const pollMs = 20000;
    let pollTimer: any = null;
    let socket: any = null;

    const load = async () => {
      await refresh();
    };

    load();

    if (socketUrl) {
      socket = io(socketUrl, { withCredentials: true, transports: ['websocket', 'polling'] });
      socket.on('resources.updated', () => load());
    } else if (apiBase) {
      pollTimer = setInterval(() => load(), pollMs);
    }

    const onStorage = (e: StorageEvent) => {
      if (!apiBase && e.key && e.key.startsWith('lazyNotez.db.resources')) {
        if (!cancelled) setItems(getResources());
      }
    };

    window.addEventListener('storage', onStorage);

    return () => {
      cancelled = true;
      window.removeEventListener('storage', onStorage);
      if (pollTimer) clearInterval(pollTimer);
      if (socket) socket.disconnect();
    };
  }, [apiBase, refresh, socketUrl]);

  return { items, source, loading, refresh };
}
