import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection by checking if we can access the database
const { data, error } = await supabase.from('users').select('count()', { count: 'exact' });

if (error) {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
} else {
  console.log('✅ Supabase connected successfully!');
  console.log('Users table is accessible');
  process.exit(0);
}
