'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { TEMPLATES, COLORS, TemplateId, ColorId, TherapistProfile } from '@/lib/template'
import TemplateCard from '../../../components/appearance/TemplateCard'
import ColorPicker from '../../../components/appearance/ColorPicker'
import Button from '@/components/ui/Button'
import { Save } from 'lucide-react'
import LivePreview from '@/components/appearance/LivePreview'
import {Eye} from 'lucide-react' ;
import DashboardLayout from '@/components/layout/DashboardLayout'


export default function AppearancePage() {
  const supabase = createClient()

  const [profile, setProfile] = useState<TherapistProfile | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic')
  const [selectedColor, setSelectedColor] = useState<ColorId>('teal')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('therapists')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setSelectedTemplate(data.template_id ?? 'classic')
        setSelectedColor(data.color_id ?? 'teal')
      }
    }
    load()
  }, [])

const previewProfile: TherapistProfile = {
  ...(profile ?? {}),
  full_name: profile?.full_name ?? 'Dr. Your Name',
  template_id: selectedTemplate,
  color_id: selectedColor,
}

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('therapists')
      .update({
        template_id: selectedTemplate,
        color_id: selectedColor,
      })
      .eq('id', user.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (

        // <DashboardLayout>
    
    <div className="p-8 max-w-4xl">

      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold text-gray-900"
          style={{ fontFamily: 'var(--font-cormorant), serif' }}
        >
          Appearance
        </h1>
        <p className="text-gray-500 mt-1">
          Choose how your public profile looks to clients.
        </p>
      </div>

      {/* Template selection */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Choose template
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TEMPLATES.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              color={selectedColor}
              selected={selectedTemplate === template.id}
              onSelect={() => setSelectedTemplate(template.id)}
            />
          ))}
        </div>
      </div>

      {/* Color selection */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Choose color
        </h2>
        <ColorPicker
          selected={selectedColor}
          onSelect={setSelectedColor}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => setPreviewOpen(true)}
        >
          <Eye size={16} className="mr-2" />
          Preview
        </Button>
        <Button
          onClick={handleSave}
          loading={saving}
        >
          <Save size={16} className="mr-2" />
          {saved ? 'Saved!' : 'Apply & Save'}
        </Button>
      </div>

      {/* Live Preview Modal */}
      {previewOpen && (
        <LivePreview
          profile={previewProfile}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>

        // </DashboardLayout>
    
  )
}