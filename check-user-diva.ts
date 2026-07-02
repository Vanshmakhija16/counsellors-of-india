/**
 * Script to check if Diva's account exists correctly
 * Run with:  npx ts-node --skip-project check-user-diva.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ukelfqbwngyabmfyxddo.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrZWxmcWJ3bmd5YWJtZnl4ZGRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg1ODcyNiwiZXhwIjoyMDkzNDM0NzI2fQ.mzXZ7XcOvml7p-oG8lmtCiOOr0qIYmju-CU7wp5cV3o'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrZWxmcWJ3bmd5YWJtZnl4ZGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NTg3MjYsImV4cCI6MjA5MzQzNDcyNn0.biUlqwrscBld9taEZnEdW3qH3T1vGMY2fMCJLFzJLRc'

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Checking Diva\'s account...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. Check auth user exists
  console.log('1️⃣  Checking auth.users...')
  const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers()
  const authUser = users?.find(u => u.email === 'divachokshi2018@gmail.com')

  if (listError) {
    console.error('   ❌ Could not fetch users:', listError.message)
  } else if (!authUser) {
    console.log('   ❌ No auth user found with email divachokshi2018@gmail.com')
    console.log('   → You need to create the user in Supabase Auth first\n')
  } else {
    console.log('   ✅ Auth user found!')
    console.log('      ID            :', authUser.id)
    console.log('      Email         :', authUser.email)
    console.log('      Email confirmed:', authUser.email_confirmed_at ? '✅ Yes' : '❌ No (needs confirmation)')
    console.log('      Created at    :', authUser.created_at)
  }

  console.log('')

  // 2. Check therapists table
  console.log('2️⃣  Checking therapists table...')
  const { data: profile, error: profileError } = await adminClient
    .from('therapists')
    .select('*')
    .eq('email', 'divachokshi2018@gmail.com')
    .single()

  if (profileError) {
    console.log('   ❌ No therapist profile found:', profileError.message)
    if (authUser) {
      console.log('   → Profile is missing! Inserting now...')
      const { error: insertError } = await adminClient
        .from('therapists')
        .insert({
          id: authUser.id,
          full_name: 'Ms Diva Choksi',
          username: 'diva',
          email: 'divachokshi2018@gmail.com',
          highest_plan: 'starter',
          is_profile_complete: false,
        })
      if (insertError) {
        console.log('   ❌ Insert failed:', insertError.message)
      } else {
        console.log('   ✅ Profile inserted successfully!')
      }
    }
  } else {
    console.log('   ✅ Therapist profile found!')
    console.log('      ID           :', profile.id)
    console.log('      Full name    :', profile.full_name)
    console.log('      Username     :', profile.username)
    console.log('      Email        :', profile.email)
    console.log('      Plan         :', profile.highest_plan)
    console.log('      Auth ID match:', authUser ? (profile.id === authUser.id ? '✅ Yes' : '❌ No — mismatch!') : '⚠️  Cannot check (no auth user)')
  }

  console.log('')

  // 3. Try signing in
  console.log('3️⃣  Trying to sign in with given credentials...')
  const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
    email: 'divachokshi2018@gmail.com',
    password: 'Divachoksi@coi1',
  })

  if (signInError) {
    console.log('   ❌ Sign in failed:', signInError.message)
    console.log('')
    console.log('   🔧 Fixing: resetting password now...')
    if (authUser) {
      const { error: resetError } = await adminClient.auth.admin.updateUserById(authUser.id, {
        password: 'Divachoksi@coi1',
        email_confirm: true,
      })
      if (resetError) {
        console.log('   ❌ Password reset failed:', resetError.message)
      } else {
        console.log('   ✅ Password reset! Try logging in again.')
      }
    } else {
      console.log('   ⚠️  Cannot reset — no auth user found.')
    }
  } else {
    console.log('   ✅ Sign in successful!')
    console.log('      User ID:', signInData.user?.id)
    console.log('      Email  :', signInData.user?.email)
  }

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Done!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
