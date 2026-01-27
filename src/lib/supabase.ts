import { createClient } from '@supabase/supabase-js'

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Smart URL detection:
// - Production (HTTPS): Use same-origin /supabase proxy (avoids mixed content)
// - Development (localhost): Use direct HTTP URL
const getSupabaseUrl = (): string => {
  // Development: use direct URL
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return import.meta.env.VITE_SUPABASE_URL || 'http://38.97.60.181:8000'
  }

  // Production: use proxy to avoid HTTPS -> HTTP mixed content issues
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/supabase`
  }

  return import.meta.env.VITE_SUPABASE_URL || 'http://38.97.60.181:8000'
}

const supabaseUrl = getSupabaseUrl()

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase anon key')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
