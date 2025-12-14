export {};

declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    // GEMINI_API_KEY is now server-side only (used in /api/gemini.ts)
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}