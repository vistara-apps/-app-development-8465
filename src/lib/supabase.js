import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Using localStorage fallback.')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

// Database table names
export const TABLES = {
  USERS: 'users',
  DREAM_ENTRIES: 'dream_entries'
}

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error)
  
  if (error?.code === 'PGRST301') {
    throw new Error('Database connection failed. Please try again.')
  }
  
  if (error?.code === '23505') {
    throw new Error('This record already exists.')
  }
  
  if (error?.code === '42501') {
    throw new Error('Permission denied. Please check your authentication.')
  }
  
  throw new Error(error?.message || 'An unexpected error occurred.')
}
