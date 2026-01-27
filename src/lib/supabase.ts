import { createClient } from '@supabase/supabase-js'

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use direct Supabase URL from environment
// The Supabase server has CORS configured to allow requests from production domain
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://38.97.60.181:8000'

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase anon key')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
