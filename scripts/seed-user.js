#!/usr/bin/env node
/**
 * Seed default user to Supabase
 * Usage: npm run seed:user
 * 
 * Environment Variables:
 * - VITE_SUPABASE_URL: Supabase project URL
 * - VITE_SUPABASE_SERVICE_KEY: Service role key for admin access
 */

// Load .env file manually
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const envPath = resolve(__dirname, '../.env')

try {
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    const value = valueParts.join('=').trim()
    if (key && value && !process.env[key.trim()]) {
      process.env[key.trim()] = value
    }
  })
} catch (e) {
  // .env not found, continue with existing env vars
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗ NOT SET');
  console.error('   VITE_SUPABASE_SERVICE_KEY:', SERVICE_KEY ? '✓' : '✗ NOT SET');
  console.error('\n📝 Add these to your .env file:');
  console.error('   VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('   VITE_SUPABASE_SERVICE_KEY=your-service-role-key');
  process.exit(1);
}

const DEFAULT_USER = {
  email: 'andifahruddinakas@gmail.com',
  password: '#4Kas???',
  display_name: 'Admin User',
};

async function seedUser() {
  try {
    console.log('🌱 Seeding default user...\n');
    console.log('📧 Email:', DEFAULT_USER.email);
    
    // Import Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    
    // Create admin client with service role key
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user already exists
    console.log('\n🔍 Checking if user exists...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    const userExists = users?.some(u => u.email === DEFAULT_USER.email);

    if (userExists) {
      console.log('✅ User already exists, skipping creation\n');
      return;
    }

    // Create user
    console.log('👤 Creating user...');
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email: DEFAULT_USER.email,
      password: DEFAULT_USER.password,
      email_confirm: true,
      user_metadata: {
        display_name: DEFAULT_USER.display_name,
      },
    });

    if (createError) {
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    console.log('✅ User created:', user.id);

    // Create profile for user
    console.log('📋 Creating user profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        display_name: DEFAULT_USER.display_name,
        avatar_url: null,
        role: 'admin',
        status: 'approved',
      })
      .select()
      .single();

    if (profileError && !profileError.message.includes('duplicate key')) {
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    console.log('✅ Profile created\n');

    // Verification
    console.log('✨ Seed Summary:');
    console.log('━'.repeat(50));
    console.log(`Email:    ${DEFAULT_USER.email}`);
    console.log(`Password: ${DEFAULT_USER.password}`);
    console.log(`User ID:  ${user.id}`);
    console.log(`Role:     admin`);
    console.log(`Status:   approved`);
    console.log('━'.repeat(50));
    console.log('\n✅ User seeded successfully!\n');
    console.log('🚀 You can now login with these credentials');

  } catch (error) {
    console.error('\n❌ Error seeding user:');
    console.error(error.message);
    process.exit(1);
  }
}

seedUser();
