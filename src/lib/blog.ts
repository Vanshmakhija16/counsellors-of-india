import { z } from 'zod'
import { createClient } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string
  slug: string
  title: string
  meta_description: string | null
  excerpt: string | null
  content: string
  tags: string[]
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

// ─── Zod schema ───────────────────────────────────────────────────────────────

const optText = z
  .string()
  .trim()
  .nullish()
  .transform((v) => (v && v.length > 0 ? v : null))

export const blogPostCreateSchema = z.object({
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/, 'slug must be lowercase letters, numbers, hyphens'),
  title: z.string().trim().min(1, 'Required').max(200),
  meta_description: optText,
  excerpt: optText,
  content: z.string().trim().min(1, 'Content is required'),
  tags: z.array(z.string().trim()).default([]),
  published: z.boolean().default(false),
})

export type BlogPostCreateInput = z.input<typeof blogPostCreateSchema>

// ─── Client-side data access (admin form) ──────────────────────────────────────

function client() {
  return createClient()
}

/** Admin-only: lists every post, published or not. RLS restricts this to
 *  therapists.role = 'admin' -- a non-admin calling this just gets an empty
 *  array back (RLS filters rows, doesn't throw), not an error. */
export async function listAllBlogPostsAdmin(): Promise<BlogPost[]> {
  const { data, error } = await client()
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as BlogPost[]
}

export async function createBlogPost(input: BlogPostCreateInput): Promise<BlogPost> {
  const parsed = blogPostCreateSchema.parse(input)
  const payload = {
    ...parsed,
    published_at: parsed.published ? new Date().toISOString() : null,
  }
  const { data, error } = await client()
    .from('blog_posts')
    .insert(payload)
    .select('*')
    .single()
  if (error) throw error
  return data as BlogPost
}

export async function updateBlogPost(
  id: string,
  input: Partial<BlogPostCreateInput>
): Promise<BlogPost> {
  const parsed = blogPostCreateSchema.partial().parse(input)
  const payload: Record<string, unknown> = { ...parsed }
  // If the post is being (re)published and doesn't have a published_at yet,
  // stamp it now -- but never clobber an existing published_at just because
  // an unrelated field on the post was edited.
  if (parsed.published === true) {
    payload.published_at = new Date().toISOString()
  } else if (parsed.published === false) {
    payload.published_at = null
  }
  const { data, error } = await client()
    .from('blog_posts')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as BlogPost
}

/** Verifies the row actually got deleted -- see the same fix applied to
 *  deleteAppointment() in clinical/appointments.ts. RLS silently returns
 *  success with zero rows affected when a policy blocks a delete, rather
 *  than throwing, so checking `error` alone isn't enough. */
export async function deleteBlogPost(id: string): Promise<void> {
  const { data, error } = await client()
    .from('blog_posts')
    .delete()
    .eq('id', id)
    .select('id')
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Delete did not go through -- you may not have permission to delete this post.')
  }
}
