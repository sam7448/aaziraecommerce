export const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
};
