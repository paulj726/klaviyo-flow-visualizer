/**
 * Supabase Client Configuration
 *
 * This module initializes and exports the Supabase client for authentication
 * and database operations. It uses environment variables to configure the
 * connection to your Supabase project.
 *
 * Environment Variables Required:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous/public API key
 */

const { createClient } = require('@supabase/supabase-js');

// Read Supabase configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate that required environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client instance
// This client can be used for authentication, database queries, and storage operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export the configured client for use throughout the application
module.exports = supabase;
