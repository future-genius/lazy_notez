export function getApiBase() {
  const raw = (import.meta as any).env?.VITE_API_BASE as string | undefined;
  if (!raw) return '';
  const trimmed = raw.replace(/\/+$/, '');
  if (trimmed.toLowerCase().endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
}

export function getSocketUrl() {
  return (window as any).__SOCKET_URL__ || (import.meta as any).env?.VITE_SOCKET_URL || '';
}

export function getAdminPanelHeaders() {
  const headers: Record<string, string> = {};
  const key = (import.meta as any).env?.VITE_ADMIN_PANEL_KEY as string | undefined;
  if (key) headers['x-admin-panel-key'] = key;

  // Dev bypass (only works if backend has no ADMIN_PANEL_KEY and NODE_ENV !== 'production')
  const devBypass = (import.meta as any).env?.VITE_ADMIN_PANEL_DEV_BYPASS as string | undefined;
  if (!key && devBypass) headers['x-admin-panel'] = devBypass;

  return headers;
}
