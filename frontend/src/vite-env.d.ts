/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WS_PROVIDER: string;
  readonly VITE_CONTRACT_ADDRESS: string;
  readonly VITE_MOCK_MODE: string;
  readonly VITE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
