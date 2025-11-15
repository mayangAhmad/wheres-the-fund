// lib/supabase-admin.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define the client type for clarity
let cachedSupabaseAdmin: SupabaseClient | null = null;

// Environment variables MUST be set for this to work
const SUPABASE_URL: string = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// The environment variable name might be SUPABASE_SERVICE_ROLE_KEY or similar
const SUPABASE_SERVICE_KEY: string = process.env.SUPABASE_SERVICE_ROLE_KEY!; 

/**
 * Creates and returns a singleton instance of the Supabase Admin client.
 * This client uses the Service Role Key and bypasses all RLS.
 * @returns {SupabaseClient} The Supabase client with admin privileges.
 */
function createSupabaseAdminClient(): SupabaseClient {
  if (cachedSupabaseAdmin) {
    return cachedSupabaseAdmin;
  }

  // ⚠️ CRITICAL: Use the Service Role Key here
  const client = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY, 
    {
      auth: {
        // Prevent it from attempting to store/manage user sessions
        persistSession: false, 
      }
    }
  );

  cachedSupabaseAdmin = client;
  return client;
}

// Export the singleton instance
export const supabaseAdmin = createSupabaseAdminClient();