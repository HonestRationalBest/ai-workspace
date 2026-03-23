/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Required. Origin of the API (e.g. http://localhost:3000 or https://api.example.com). */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
