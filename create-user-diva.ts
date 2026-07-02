/**
 * Script to create account for Ms Diva Choksi
 * Run with:  npx ts-node --skip-project create-user-diva.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ukelfqbwngyabmfyxddo.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrZWxmcWJ3bmd5YWJtZnl4ZGRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg1ODcyNiwiZXhwIjoyMDkzNDM0NzI2fQ.mzXZ7XcOvml7p-oG8lmtCiOOr0qIYmju-CU7wp5cV3o'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  console.log('Creating auth user...')

  // 1. Create the auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'divachokshi2018@gmail.com',
    password: 'Divachoksi@coi1',
    email_confirm: true,
  })

  if (authError) {
    console.error('❌ Auth user creation failed:', authError.message)
    process.exit(1)
  }

  const userId = authData.user.id
  console.log('✅ Auth user created:', userId)

  // 2. Insert therapist profile
  console.log('Creating therapist profile...')

  const { error: profileError } = await supabase
    .from('therapists')
    .insert({
      id: userId,
      full_name: 'Ms Diva Choksi',
      username: 'diva',
      email: 'divachokshi2018@gmail.com',
      highest_plan: 'starter',
      is_profile_complete: false,
    })

  if (profileError) {
    console.error('❌ Profile creation failed:', profileError.message)
    console.log('ℹ️  Auth user was created (id:', userId, ') — delete it from Supabase dashboard if needed.')
    process.exit(1)
  }

  console.log('✅ Profile created for diva')
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Account ready!')
  console.log('  Name    : Ms Diva Choksi')
  console.log('  Username: diva')
  console.log('  Email   : divachokshi2018@gmail.com')
  console.log('  Password: Divachoksi@coi1')
  console.log('  Plan    : Starter')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
