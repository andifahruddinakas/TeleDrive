import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

console.log('🔗 Testing Supabase Connection...\n')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env')
  console.error('Current .env values:')
  console.error(`  VITE_SUPABASE_URL: ${supabaseUrl || 'NOT SET'}`)
  console.error(`  VITE_SUPABASE_KEY: ${supabaseKey ? 'SET' : 'NOT SET'}`)
  process.exit(1)
}

console.log('📍 Project URL:', supabaseUrl)
console.log('🔑 API Key:', supabaseKey.substring(0, 20) + '...\n')

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})

console.log('✅ Supabase client created successfully!\n')

// Try to query tables
async function testConnection() {
  console.log('🧪 Testing database connection...\n')
  
  try {
    // Test 1: Profiles table
    console.log('  📋 Testing profiles table...')
    const { data: profiles, error: profilesError, count: profilesCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    if (profilesError) {
      console.error('  ❌ Profiles error:', profilesError.message)
    } else {
      console.log(`  ✅ Profiles table exists (${profilesCount || 0} rows)`)
    }
    
    // Test 2: Folders table
    console.log('  📁 Testing folders table...')
    const { error: foldersError, count: foldersCount } = await supabase
      .from('folders')
      .select('*', { count: 'exact', head: true })
    
    if (foldersError) {
      console.error('  ❌ Folders error:', foldersError.message)
    } else {
      console.log(`  ✅ Folders table exists (${foldersCount || 0} rows)`)
    }
    
    // Test 3: Files table
    console.log('  📄 Testing files table...')
    const { error: filesError, count: filesCount } = await supabase
      .from('files')
      .select('*', { count: 'exact', head: true })
    
    if (filesError) {
      console.error('  ❌ Files error:', filesError.message)
    } else {
      console.log(`  ✅ Files table exists (${filesCount || 0} rows)`)
    }
    
    // Test 4: File chunks table
    console.log('  📦 Testing file_chunks table...')
    const { error: chunksError, count: chunksCount } = await supabase
      .from('file_chunks')
      .select('*', { count: 'exact', head: true })
    
    if (chunksError) {
      console.error('  ❌ File chunks error:', chunksError.message)
    } else {
      console.log(`  ✅ File chunks table exists (${chunksCount || 0} rows)`)
    }
    
    console.log('\n✨ All tests completed!')
    console.log('\n🎉 Supabase is ready for development!\n')
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message)
    console.error('Error details:', error)
    process.exit(1)
  }
}

// Run tests
testConnection().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
