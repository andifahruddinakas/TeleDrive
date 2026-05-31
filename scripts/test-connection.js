#!/usr/bin/env node
/**
 * Simple Supabase Connection Test
 * Run: node scripts/test-connection.js
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

console.log('\n🔗 Testing Supabase Connection...\n')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing environment variables')
  console.error(`  VITE_SUPABASE_URL: ${supabaseUrl ? '✓ SET' : '✗ NOT SET'}`)
  console.error(`  VITE_SUPABASE_KEY: ${supabaseKey ? '✓ SET' : '✗ NOT SET'}`)
  console.error('\n📝 Make sure .env file exists with these variables')
  process.exit(1)
}

console.log('📍 Project URL:', supabaseUrl)
console.log('🔑 API Key:', supabaseKey.substring(0, 15) + '...')
console.log('')

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('✅ Supabase client created successfully!\n')

async function testConnection() {
  console.log('🧪 Testing database connection...\n')
  
  const tables = ['profiles', 'folders', 'files', 'file_chunks']
  let successCount = 0
  
  for (const table of tables) {
    process.stdout.write(`  📋 Testing ${table}... `)
    
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ERROR: ${error.message}`)
      } else {
        console.log(`✅ OK (${count || 0} rows)`)
        successCount++
      }
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`)
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log(`Result: ${successCount}/${tables.length} tables accessible\n`)
  
  if (successCount === tables.length) {
    console.log('🎉 SUCCESS! Supabase is connected and ready!\n')
    process.exit(0)
  } else if (successCount > 0) {
    console.log('⚠️  Some tables are missing. Run migrations first:\n')
    console.log('   .\\scripts\\migrate-and-test.ps1 full-setup\n')
    process.exit(1)
  } else {
    console.log('❌ No tables found. Database migrations not applied.\n')
    console.log('Run migration script first:\n')
    console.log('   .\\scripts\\migrate-and-test.ps1 full-setup\n')
    process.exit(1)
  }
}

testConnection().catch(error => {
  console.error('\n❌ Fatal error:', error.message)
  process.exit(1)
})
