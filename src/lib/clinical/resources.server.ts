import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Resource, PatientResourceWithResource } from './resources'

export async function listAssignedResourcesServer(
  patientId: string
): Promise<PatientResourceWithResource[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('patient_resources')
    .select('*, resource:resources(*)')
    .eq('patient_id', patientId)
    .order('assigned_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    ...row,
    resource: Array.isArray(row.resource) ? row.resource[0] : row.resource,
  })) as PatientResourceWithResource[]
}

export async function listResourcesServer(): Promise<Resource[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('title')
  if (error) throw error
  return (data ?? []) as Resource[]
}
