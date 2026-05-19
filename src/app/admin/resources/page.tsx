'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, FileText, BookOpen, Video, Link2, AlertCircle, Loader2, Upload, X } from 'lucide-react'
import { listResources, type Resource, type ResourceKind } from '@/lib/clinical/resources'
import { createClient } from '@/lib/supabase'
import { resourceCreateSchema } from '@/lib/clinical/resources'

const KIND_ICONS: Record<ResourceKind, React.ElementType> = {
  worksheet: FileText,
  reading:   BookOpen,
  video:     Video,
  link:      Link2,
}

const EMPTY_FORM = {
  slug: '', title: '', description: '', kind: 'worksheet' as ResourceKind,
  external_url: '', tags: '', domain: '',
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [formErr, setFormErr] = useState<string | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    listResources()
      .then(setResources)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate() {
    setSaving(true)
    setFormErr(null)
    try {
      if (!file && !form.external_url) {
        throw new Error('Provide either a file upload or an external URL')
      }
      if (!form.slug.trim() || !form.title.trim()) {
        throw new Error('Title and slug are required')
      }

      const supabase = createClient()
      let filePath: string | null = null

      if (file) {
        const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
        const safeSlug = form.slug.replace(/[^a-z0-9-]/g, '-')
        filePath = `${safeSlug}/${Date.now()}-${safeSlug}.${ext}`
        setUploadProgress(20)
        const { error: upErr } = await supabase.storage
          .from('clinical-resources')
          .upload(filePath, file, { upsert: false, contentType: file.type })
        if (upErr) throw upErr
        setUploadProgress(80)
      }

      const parsed = resourceCreateSchema.parse({
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        external_url: form.external_url || null,
        description: form.description || null,
        domain: form.domain || null,
        file_path: filePath,
      })

      const { data, error } = await supabase
        .from('resources')
        .insert(parsed)
        .select('*')
        .single()
      if (error) {
        if (filePath) {
          await supabase.storage.from('clinical-resources').remove([filePath]).catch(() => {})
        }
        throw error
      }

      setResources((prev) => [data as Resource, ...prev])
      setForm(EMPTY_FORM)
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setShowForm(false)
      setUploadProgress(0)
    } catch (e: unknown) {
      setFormErr(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(r: Resource) {
    if (!confirm('Delete this resource? Existing patient assignments will be removed.')) return
    const supabase = createClient()
    const { error } = await supabase.from('resources').delete().eq('id', r.id)
    if (error) {
      alert(error.message)
      return
    }
    if (r.file_path) {
      await supabase.storage.from('clinical-resources').remove([r.file_path]).catch(() => {})
    }
    setResources((prev) => prev.filter((x) => x.id !== r.id))
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-semibold text-[#1c1c1e]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Resource Library
          </h1>
          <p className="text-sm text-[#6b7280] mt-1">Admin-only · Manage worksheets, readings, and links</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[#354744] text-white text-sm font-medium hover:bg-[#1a2f2d] transition"
        >
          <Plus size={15} /> Add resource
        </button>
      </div>

      {/* Admin disclaimer */}
      <div className="flex items-start gap-3 rounded-lg border border-[#e8e4df] bg-[#fdf8f6] px-4 py-3 mb-6">
        <AlertCircle size={15} className="text-[#6b7280] mt-0.5 shrink-0" />
        <p className="text-xs text-[#6b7280]">
          This area is gated by <code className="bg-gray-100 px-1 rounded">therapists.role = 'admin'</code>.
          Resources added here are visible to all therapists in the library.
        </p>
      </div>

      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{err}</div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#e8e4df] p-6 mb-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#1c1c1e]" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
            New resource
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Title *">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="e.g. Thought Record Worksheet" />
            </Field>
            <Field label="Slug *">
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputCls} placeholder="e.g. thought-record" />
            </Field>
          </div>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputCls + ' resize-none'} />
          </Field>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Kind">
              <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as ResourceKind })} className={inputCls}>
                <option value="worksheet">Worksheet</option>
                <option value="reading">Reading</option>
                <option value="video">Video</option>
                <option value="link">Link</option>
              </select>
            </Field>
            <Field label="Domain">
              <input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} className={inputCls} placeholder="depression / anxiety / general" />
            </Field>
            <Field label="Tags (comma-separated)">
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputCls} placeholder="CBT, worksheets" />
            </Field>
          </div>
          <Field label="File upload (worksheet PDFs, images, video files)">
            {file ? (
              <div className="flex items-center justify-between gap-3 px-3 h-10 rounded-lg border border-[#b8ceca] bg-[#d4e4e1]/40">
                <span className="text-xs text-[#2d4a47] truncate">
                  <Upload size={11} className="inline mr-1" />
                  {file.name} · {(file.size / 1024).toFixed(0)} KB
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="text-[#6b7280] hover:text-red-600 transition"
                  aria-label="Remove file"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 h-10 px-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-600 cursor-pointer hover:bg-gray-100 transition">
                <Upload size={13} />
                Choose a file…
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4,.mov"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </Field>

          <Field label="External URL (or leave blank if uploading a file)">
            <input value={form.external_url} onChange={(e) => setForm({ ...form, external_url: e.target.value })} className={inputCls} placeholder="https://…" />
          </Field>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#2d4a47] transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}

          {formErr && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{formErr}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => {
                setShowForm(false)
                setForm(EMPTY_FORM)
                setFormErr(null)
                setFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="h-10 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={saving}
              className="h-10 px-5 rounded-lg bg-[#354744] text-white text-sm font-medium hover:bg-[#1a2f2d] disabled:opacity-40 flex items-center gap-2 transition">
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : 'Save resource'}
            </button>
          </div>
        </div>
      )}

      {/* Resources list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-6 h-6 rounded-full border-2 border-[#a3b8b4] border-t-transparent" />
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e8e4df] px-6 py-16 text-center">
          <BookOpen size={28} className="text-[#e8e4df] mx-auto mb-3" />
          <p className="text-sm text-[#6b7280]">No resources yet. Add one above.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {resources.map((r) => {
            const Icon = KIND_ICONS[r.kind] ?? Link2
            return (
              <li key={r.id} className="bg-white rounded-xl border border-[#e8e4df] p-5 flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-[#d4e4e1] text-[#2d4a47] flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1c1c1e]">{r.title}</p>
                  <p className="text-xs font-mono text-[#9ca3af]">{r.slug} · {r.kind} · {r.domain ?? 'general'}</p>
                  {r.description && <p className="text-xs text-[#6b7280] mt-1">{r.description}</p>}
                </div>
                <button onClick={() => handleDelete(r)}
                  className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 transition shrink-0">
                  <Trash2 size={13} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

const inputCls = 'w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
