import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // uso server-side (scripts/API routes), nunca no browser

if (!url || !key) {
  throw new Error(
    "Faltam SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no .env. Veja .env.example.",
  );
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
