import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { BlogPost } from './blog'

/** Public reads only -- RLS's "anyone reads published posts" policy already
 *  restricts this to published = true, so no extra .eq() needed here, but
 *  being explicit keeps this function's contract obvious without having to
 *  go check the RLS policy to know what it returns. */
export async function listPublishedBlogPostsServer(): Promise<BlogPost[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as BlogPost[]
}

export async function getPublishedBlogPostBySlugServer(slug: string): Promise<BlogPost | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()
  if (error) throw error
  return data as BlogPost | null
}
