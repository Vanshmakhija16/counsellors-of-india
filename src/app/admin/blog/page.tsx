'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, PenLine, AlertCircle, Loader2, X, Eye, EyeOff } from 'lucide-react'
import {
  listAllBlogPostsAdmin,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  type BlogPost,
} from '@/lib/blog'

const EMPTY_FORM = {
  slug: '', title: '', meta_description: '', excerpt: '', content: '', tags: '', published: false,
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [formErr, setFormErr] = useState<string | null>(null)

  useEffect(() => {
    listAllBlogPostsAdmin()
      .then(setPosts)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }, [])

  function startEdit(p: BlogPost) {
    setEditingId(p.id)
    setForm({
      slug: p.slug,
      title: p.title,
      meta_description: p.meta_description ?? '',
      excerpt: p.excerpt ?? '',
      content: p.content,
      tags: p.tags.join(', '),
      published: p.published,
    })
    setShowForm(true)
  }

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormErr(null)
  }

  async function handleSave() {
    setSaving(true)
    setFormErr(null)
    try {
      if (!form.slug.trim() || !form.title.trim() || !form.content.trim()) {
        throw new Error('Slug, title, and content are required')
      }
      const payload = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        meta_description: form.meta_description || null,
        excerpt: form.excerpt || null,
        content: form.content,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        published: form.published,
      }

      if (editingId) {
        const updated = await updateBlogPost(editingId, payload)
        setPosts((prev) => prev.map((p) => (p.id === editingId ? updated : p)))
      } else {
        const created = await createBlogPost(payload)
        setPosts((prev) => [created, ...prev])
      }
      resetForm()
    } catch (e: unknown) {
      setFormErr(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleTogglePublish(p: BlogPost) {
    try {
      const updated = await updateBlogPost(p.id, { published: !p.published })
      setPosts((prev) => prev.map((x) => (x.id === p.id ? updated : x)))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update')
    }
  }

  async function handleDelete(p: BlogPost) {
    if (!confirm(`Delete "${p.title}"? This can't be undone.`)) return
    try {
      await deleteBlogPost(p.id)
      setPosts((prev) => prev.filter((x) => x.id !== p.id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not delete this post.')
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-semibold text-[#1c1c1e]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Blog posts
          </h1>
          <p className="text-sm text-[#6b7280] mt-1">Admin-only &middot; Write, edit, and publish journal posts</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[#354744] text-white text-sm font-medium hover:bg-[#1a2f2d] transition"
        >
          <Plus size={15} /> New post
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-[#e8e4df] bg-[#fdf8f6] px-4 py-3 mb-6">
        <AlertCircle size={15} className="text-[#6b7280] mt-0.5 shrink-0" />
        <div className="text-xs text-[#6b7280] space-y-1">
          <p>
            This area is gated by <code className="bg-gray-100 px-1 rounded">therapists.role = 'admin'</code>.
            Only published posts appear on the public <code className="bg-gray-100 px-1 rounded">/blog</code> page.
            Content is written in Markdown &mdash; use <code className="bg-gray-100 px-1 rounded">## heading</code>,{' '}
            <code className="bg-gray-100 px-1 rounded">**bold**</code>, and blank lines between paragraphs.
          </p>
          <p>
            Posts render in a page-flipping book reader, so write short, natural paragraphs
            (3&ndash;5 sentences, under ~80 words) rather than long blocks of text &mdash; break to a
            new paragraph whenever the idea shifts, vary sentence length, and add a{' '}
            <code className="bg-gray-100 px-1 rounded">##</code>/<code className="bg-gray-100 px-1 rounded">###</code>{' '}
            subheading roughly every 300&ndash;400 words so each page has room to breathe.
          </p>
        </div>
      </div>

      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{err}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-[#e8e4df] p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1c1c1e]" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
              {editingId ? 'Edit post' : 'New post'}
            </h2>
            <button onClick={resetForm} className="text-[#9ca3af] hover:text-[#1c1c1e]" aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Title *">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="e.g. How to choose your therapy niche" />
            </Field>
            <Field label="Slug * (used in /blog/slug)">
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputCls} placeholder="e.g. how-to-choose-your-therapy-niche" />
            </Field>
          </div>

          <Field label="Excerpt (shown on the /blog listing card)">
            <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className={inputCls + ' resize-none'} />
          </Field>

          <Field label="Meta description (for search engines)">
            <textarea value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} rows={2} className={inputCls + ' resize-none'} />
          </Field>

          <Field label="Content * (Markdown)">
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={16} className={inputCls + ' resize-y font-mono text-xs'} placeholder={'## Introduction\n\nShort paragraphs (3\u20135 sentences), like a magazine article \u2014 not one long block of text.\n\nBreak to a new paragraph whenever the idea shifts, and leave a blank line between paragraphs.'} />
          </Field>

          <Field label="Tags (comma-separated)">
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputCls} placeholder="practice growth, marketing" />
          </Field>

          <label className="flex items-center gap-2 text-sm text-[#1c1c1e] cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4" />
            Published (visible on the public /blog page)
          </label>

          {formErr && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{formErr}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={resetForm} className="h-10 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="h-10 px-5 rounded-lg bg-[#354744] text-white text-sm font-medium hover:bg-[#1a2f2d] disabled:opacity-40 flex items-center gap-2 transition">
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving&hellip;</> : 'Save post'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-6 h-6 rounded-full border-2 border-[#a3b8b4] border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e8e4df] px-6 py-16 text-center">
          <PenLine size={28} className="text-[#e8e4df] mx-auto mb-3" />
          <p className="text-sm text-[#6b7280]">No posts yet. Add one above.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.id} className="bg-white rounded-xl border border-[#e8e4df] p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-[#d4e4e1] text-[#2d4a47] flex items-center justify-center shrink-0">
                <PenLine size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-[#1c1c1e]">{p.title}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide ${p.published ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {p.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs font-mono text-[#9ca3af]">/blog/{p.slug}</p>
                {p.excerpt && <p className="text-xs text-[#6b7280] mt-1">{p.excerpt}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleTogglePublish(p)}
                  className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#2d4a47] hover:border-[#b8ceca] transition"
                  aria-label={p.published ? 'Unpublish' : 'Publish'} title={p.published ? 'Unpublish' : 'Publish'}>
                  {p.published ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button onClick={() => startEdit(p)}
                  className="h-8 px-3 rounded-lg border border-gray-200 flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition">
                  Edit
                </button>
                <button onClick={() => handleDelete(p)}
                  className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 transition">
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
