import { createClient } from '@supabase/supabase-js';
import { config } from './env';

export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Dedicated client for user auth operations (login/signup)
// Ensures supabaseAdmin's service_role session is NEVER overwritten by user credentials
export const createAuthClient = () =>
  createClient(config.supabase.url, config.supabase.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
