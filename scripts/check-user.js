#!/usr/bin/env node
/**
 * Check if user exists dan status mereka
 */

const SUPABASE_URL = 'https://pnbilvxvdryqzarkwbza.supabase.co'
const SUPABASE_KEY = 'sb_publishable_-U-34l_KlfG7XudknLuS5Q_-y-VbXhP'

async function checkUser() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    console.log('🔍 Checking user status...\n')

    // Get all users
    const { data, error } = await supabase
      .from('profiles')
      .select('*, user_id')

    if (error) {
      console.error('❌ Error:', error.message)
      return
    }

    if (!data || data.length === 0) {
      console.log('❌ No users found in database')
      console.log('\n📝 You need to seed the default user first:')
      console.log('   1. Get VITE_SUPABASE_SERVICE_KEY from https://app.supabase.com')
      console.log('   2. Add to .env: VITE_SUPABASE_SERVICE_KEY=...')
      console.log('   3. Run: npm run seed:user')
      return
    }

    console.log('👥 Users in database:')
    console.log('━'.repeat(70))
    data.forEach((user, idx) => {
      console.log(`\n${idx + 1}. User`)
      console.log(`   User ID:      ${user.user_id}`)
      console.log(`   Name:         ${user.display_name || 'N/A'}`)
      console.log(`   Role:         ${user.role}`)
      console.log(`   Status:       ${user.status}`)
      console.log(`   Created:      ${new Date(user.created_at).toLocaleString()}`)
    })

    console.log('\n' + '━'.repeat(70))

    // Check if andifahruddinakas@gmail.com exists
    const { data: registrations } = await supabase
      .from('user_registrations')
      .select('*')

    const targetUser = registrations?.find(
      u => u.email === 'andifahruddinakas@gmail.com'
    )

    if (targetUser) {
      console.log('\n✅ andifahruddinakas@gmail.com found!')
      console.log(`   Status: ${targetUser.status}`)
      if (targetUser.status === 'pending') {
        console.log('\n⚠️  User status is PENDING')
        console.log('   Admin needs to APPROVE the registration first')
      } else if (targetUser.status === 'approved') {
        console.log('\n✅ User is APPROVED')
        console.log('   Should be able to login with: #4Kas???')
      } else if (targetUser.status === 'rejected') {
        console.log('\n❌ User was REJECTED')
        console.log(`   Reason: ${targetUser.rejection_reason || 'N/A'}`)
      }
    } else {
      console.log('\n❌ andifahruddinakas@gmail.com NOT found')
      console.log('   Need to run: npm run seed:user')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkUser()
