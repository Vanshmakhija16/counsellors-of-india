import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getCurrentTenant } from '@/lib/tenants/server'
import type { BlogPost } from './blog'

/**
 * Which Supabase project the PUBLIC blog is read from.
 *
 * - India: unchanged -- the normal tenant-aware server client (India's own
 *   project), exactly as before this change.
 * - Every other tenant (America, etc.): the blog content is authored once,
 *   in India's project, and shared. Those tenants' own Supabase projects
 *   don't have a `blog_posts` table, which is why /blog was erroring there.
 *   This reads India's published posts with India's ANON key (public,
 *   RLS-protected -- the "anyone reads published posts" policy limits it to
 *   published = true), never the service-role key.
 *
 * Needs SUPABASE_URL_IN + SUPABASE_ANON_KEY_IN, or the original
 * NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY, to be set in the
 * environment of the deployment serving the non-India tenants.
 */
async function getBlogSupabase(): Promise<SupabaseClient> {
  const tenant = await getCurrentTenant()
  if (tenant.id === 'in') {
    return (await createServerSupabaseClient()) as unknown as SupabaseClient
  }

  const url =
    process.env.SUPABASE_URL_IN && process.env.SUPABASE_ANON_KEY_IN
      ? process.env.SUPABASE_URL_IN
      : process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey =
    process.env.SUPABASE_URL_IN && process.env.SUPABASE_ANON_KEY_IN
      ? process.env.SUPABASE_ANON_KEY_IN
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Blog content source (India Supabase) is not configured: set SUPABASE_URL_IN and SUPABASE_ANON_KEY_IN ' +
      '(or NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) for this deployment.'
    )
  }

  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

/** Public reads only -- RLS's "anyone reads published posts" policy already
 *  restricts this to published = true, so no extra .eq() needed here, but
 *  being explicit keeps this function's contract obvious without having to
 *  go check the RLS policy to know what it returns. */
export async function listPublishedBlogPostsServer(): Promise<BlogPost[]> {
  const supabase = await getBlogSupabase()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as BlogPost[]
}

export async function getPublishedBlogPostBySlugServer(slug: string): Promise<BlogPost | null> {
  const supabase = await getBlogSupabase()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()
  if (error) throw error
  return data as BlogPost | null
}
