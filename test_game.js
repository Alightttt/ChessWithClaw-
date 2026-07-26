const http = require('http');

async function test() {
  const { createClient } = require('@supabase/supabase-js');
  require('dotenv').config();
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data } = await supabase.from('games').select('*').order('created_at', { ascending: false }).limit(1);
  console.log(data);
}
test();
