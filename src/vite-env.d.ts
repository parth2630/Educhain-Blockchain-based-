/// <reference types="vite/client" />

interface Window {
  ethereum?: {
    request: (args: { method: string }) => Promise<string[]>;
  };
}

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS: string;
  readonly VITE_SEPOLIA_RPC_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}