/**
 * Run with:  node fix-diva.js
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://ukelfqbwngyabmfyxddo.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrZWxmcWJ3bmd5YWJtZnl4ZGRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg1ODcyNiwiZXhwIjoyMDkzNDM0NzI2fQ.mzXZ7XcOvml7p-oG8lmtCiOOr0qIYmju-CU7wp5cV3o'

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  const { error } = await adminClient
    .from('therapists')
    .update({
      full_name: 'Ms Diva Choksi',
      highest_plan: 'starter',
    })
    .eq('email', 'divachokshi2018@gmail.com')

  if (error) {
    console.log('❌ Failed:', error.message)
  } else {
    console.log('✅ Updated! Name → Ms Diva Choksi, Plan → starter')
  }
}

main()
