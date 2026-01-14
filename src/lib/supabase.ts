import { createClient } from '@supabase/supabase-js'

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Smart URL detection:
// - Production: Use same-origin /supabase path (avoids CORS/mixed-content)
// - Development: Use VITE_SUPABASE_URL from .env (direct HTTP)
const getSupabaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL

  // If running on localhost, use the env URL directly (HTTP works on localhost)
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return envUrl || 'http://38.97.60.181:8000'
  }

  // Production: Use same-origin proxy path
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/supabase`
  }

  // Fallback for SSR or testing
  return envUrl || 'http://38.97.60.181:8000'
}

const supabaseUrl = getSupabaseUrl()

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase anon key')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
