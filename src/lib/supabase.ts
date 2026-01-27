import { createClient } from '@supabase/supabase-js'

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase anon key')
}

// Runtime URL detection - uses proxy in production to avoid mixed content
// DO NOT optimize - this MUST run at runtime in browser
const getSupabaseUrl = (): string => {
  // Force runtime evaluation by checking window
  const win = typeof window !== 'undefined' ? window : null
  if (!win) {
    return 'http://38.97.60.181:8000'
  }

  // Development: direct URL
  if (win.location.hostname === 'localhost') {
    return 'http://38.97.60.181:8000'
  }

  // Production: use same-origin proxy to avoid HTTPS->HTTP mixed content
  return win.location.origin + '/supabase'
}

export const supabase = createClient(getSupabaseUrl(), supabaseAnonKey)
