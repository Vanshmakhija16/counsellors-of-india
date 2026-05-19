import { z } from 'zod'
import { createClient } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResourceKind = 'worksheet' | 'reading' | 'video' | 'link'

export interface Resource {
  id: string
  slug: string
  title: string
  description: string | null
  kind: ResourceKind
  file_path: string | null
  external_url: string | null
  tags: string[]
  domain: string | null
  created_at: string
}

export interface PatientResource {
  id: string
  therapist_id: string
  patient_id: string
  resource_id: string
  assigned_at: string
  due_date: string | null
  completed_at: string | null
  note: string | null
}

export interface PatientResourceWithResource extends PatientResource {
  resource: Resource
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const optText = z
  .string()
  .trim()
  .nullish()
  .transform((v) => (v && v.length > 0 ? v : null))

export const resourceCreateSchema = z.object({
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/, 'slug must be lowercase letters, numbers, hyphens'),
  title: z.string().trim().min(1, 'Required').max(200),
  description: optText,
  kind: z.enum(['worksheet', 'reading', 'video', 'link']),
  file_path: optText,
  external_url: optText,
  tags: z.array(z.string().trim()).default([]),
  domain: optText,
})

export const assignResourceSchema = z.object({
  resource_id: z.string().uuid(),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish()
    .transform((v) => v ?? null),
  note: optText,
})

export type ResourceCreateInput = z.input<typeof resourceCreateSchema>
export type AssignResourceInput = z.input<typeof assignResourceSchema>

// ─── Data access (client-side) ────────────────────────────────────────────────

function client() {
  return createClient()
}

export async function listResources(params: {
  search?: string
  domain?: string
  kind?: ResourceKind
} = {}): Promise<Resource[]> {
  let q = client().from('resources').select('*').order('title')

  if (params.domain) q = q.eq('domain', params.domain)
  if (params.kind) q = q.eq('kind', params.kind)
  if (params.search) {
    const s = params.search.trim()
    q = q.or(`title.ilike.%${s}%,description.ilike.%${s}%,tags.cs.{${s}}`)
  }

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Resource[]
}

export async function listAssignedResources(
  patientId: string
): Promise<PatientResourceWithResource[]> {
  const { data, error } = await client()
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

export async function assignResource(
  patientId: string,
  input: AssignResourceInput
): Promise<PatientResource> {
  const parsed = assignResourceSchema.parse(input)
  const supabase = client()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('patient_resources')
    .upsert(
      {
        therapist_id: session.user.id,
        patient_id: patientId,
        resource_id: parsed.resource_id,
        due_date: parsed.due_date,
        note: parsed.note,
      },
      { onConflict: 'patient_id,resource_id' }
    )
    .select('*')
    .single()
  if (error) throw error
  return data as PatientResource
}

export async function unassignResource(patientResourceId: string): Promise<void> {
  const { error } = await client()
    .from('patient_resources')
    .delete()
    .eq('id', patientResourceId)
  if (error) throw error
}

export async function markResourceComplete(
  patientResourceId: string,
  complete: boolean
): Promise<PatientResource> {
  const { data, error } = await client()
    .from('patient_resources')
    .update({ completed_at: complete ? new Date().toISOString() : null })
    .eq('id', patientResourceId)
    .select('*')
    .single()
  if (error) throw error
  return data as PatientResource
}

/** Signed URL for downloading a file from the clinical-resources bucket */
export async function getResourceSignedUrl(filePath: string): Promise<string> {
  const { data, error } = await client()
    .storage.from('clinical-resources')
    .createSignedUrl(filePath, 60 * 60) // 1 hour
  if (error) throw error
  return data.signedUrl
}

// Server-only reads (`listAssignedResourcesServer`, `listResourcesServer`)
// live in `./resources.server.ts`.
