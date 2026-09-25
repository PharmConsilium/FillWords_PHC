/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BRAND?: 'bayer';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
