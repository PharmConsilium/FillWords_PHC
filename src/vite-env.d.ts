/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BRAND?: 'bayer' | 'egis';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
