// server/src/lib/supabase.ts
// Supabase admin client — uses service role key for unrestricted access

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL ?? 'http://localhost:8000'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'your-service-role-key'

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Regular client for operations that should respect RLS
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? 'your-anon-key'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
