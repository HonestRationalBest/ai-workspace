/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional. Public origin of the Node API (e.g. https://api.example.com). In dev, Vite proxies `/api` to the server if unset. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
