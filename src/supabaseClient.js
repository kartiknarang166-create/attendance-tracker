import { createClient } from '@supabase/supabase-js';

// Pull the secure keys from your .env.local file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Initialize the Supabase client and export it for your app to use
export const supabase = createClient(supabaseUrl, supabasePublishableKey);