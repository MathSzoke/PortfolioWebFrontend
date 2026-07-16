/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BITERN_API: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
