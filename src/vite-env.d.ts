/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_API_BASE?: string;
  readonly VITE_SOCKET_URL?: string;
  readonly VITE_ADMIN_PANEL_KEY?: string;
  readonly VITE_ADMIN_PANEL_DEV_BYPASS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
