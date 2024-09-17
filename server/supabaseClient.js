require('dotenv').config(); // Load .env file

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be provided.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = { supabase };
