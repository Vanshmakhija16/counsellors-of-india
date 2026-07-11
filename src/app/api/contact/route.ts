/**
 * POST /api/contact
 *
 * Public "Contact Us" form submission handler.
 * Required: name, email, phone. Optional: concern.
 *
 * Stores the submission in Supabase (contact_submissions table — see
 * migration_contact_submissions.sql) and emails the team via the same
 * SMTP/nodemailer setup used for booking notifications. Storage and email
 * are independent: if the email fails, the submission is still saved.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

function escapeHtml(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name    = typeof body.name === 'string' ? body.name.trim() : ''
    const email   = typeof body.email === 'string' ? body.email.trim() : ''
    const phone   = typeof body.phone === 'string' ? body.phone.trim() : ''
    const concern = typeof body.concern === 'string' ? body.concern.trim() : ''

    // ── Validate required fields ──────────────────────────────────────────
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and mobile number are required.' },
        { status: 400 }
      )
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) {
      return NextResponse.json({ error: 'Invalid mobile number.' }, { status: 400 })
    }

    // ── Store in Supabase ──────────────────────────────────────────────────
    const supabase = createServiceSupabaseClient()
    const { data: saved, error: insertErr } = await supabase
      .from('contact_submissions')
      .insert({ name, email, phone, concern: concern || null })
      .select('id')
      .single()

    if (insertErr) {
      console.error('[api/contact] insert failed:', insertErr)
      return NextResponse.json({ error: 'Could not save your message. Please try again.' }, { status: 500 })
    }

    // ── Email the team (non-blocking, never fails the response) ───────────
    ;(async () => {
      try {
        const nodemailer = await import('nodemailer')
        const transporter = nodemailer.default.createTransport({
          host:   process.env.SMTP_HOST,
          port:   Number(process.env.SMTP_PORT),
          secure: process.env.SMTP_SECURE === 'true',
          auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        })
        const FROM = process.env.SMTP_FROM || 'Counsellors of India <support@counsellorsofindia.com>'
        const TO   = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER

        await transporter.sendMail({
          from:    FROM,
          to:      TO,
          replyTo: email,
          subject: `New contact form submission from ${name}`,
          html: `
<html><body style="font-family:sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a18">New Contact Form Submission</h2>
  <p><strong>Name:</strong> ${escapeHtml(name)}</p>
  <p><strong>Email:</strong> ${escapeHtml(email)}</p>
  <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
  ${concern ? `<p><strong>Concern:</strong><br/>${escapeHtml(concern).replace(/\n/g, '<br/>')}</p>` : '<p style="color:#888">No additional concern provided.</p>'}
</body></html>`,
        })
      } catch (e) {
        console.error('[api/contact] notification email failed:', e)
      }
    })()

    return NextResponse.json({ success: true, id: (saved as { id: string }).id })
  } catch (err: unknown) {
    console.error('[api/contact]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
