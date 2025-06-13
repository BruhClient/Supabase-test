import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_URL!,
  process.env.NEXT_ANON_KEY!
);
