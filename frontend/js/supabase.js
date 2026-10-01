// Import the Supabase client from the CDN.
const { createClient } = supabase;


// Your Supabase project URL.
const SUPABASE_URL = "https://ijrybioyuhfbauvvjfib.supabase.co";


// Your browser-safe publishable/anon key.
const SUPABASE_KEY = "sb_publishable_xcfaF0oYOIzagMHzXeh-EQ_uUifeywh";


// Create the Supabase client.
const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);