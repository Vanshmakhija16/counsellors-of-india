import 'server-only'

/**
 * lib/booking-notifications.ts
 *
 * Single place that decides HOW a therapist's booking confirmations go out,
 * and sends them. Used by all three places a booking can become confirmed:
 *   - booking/hold/route.ts        (free sessions -- confirmed instantly)
 *   - razorpay/therapist-verify    (manual-key paid sessions)
 *   - razorpay/oauth/webhook       (OAuth-connected paid sessions, via
 *                                   payment.captured)
 *
 * Channel is decided by the therapist's plan:
 *   - starter (default) -> email only, to both client and therapist
 *   - pro               -> WhatsApp only, to both client and therapist
 *
 * Each send is independently try/caught -- a failed WhatsApp send never
 * blocks the email (not that both run together, but future-proofing), and
 * a notification failure never blocks the booking/payment response itself.
 * Callers should invoke notifyBookingConfirmed() fire-and-forget, same
 * pattern already used for WhatsApp elsewhere in this codebase.
 */

import { sendBookingConfirmation, sendTherapistBookingAlert } from '@/lib/whatsapp'

function escapeHtml(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function formatDateTime(scheduledAt: string): { formattedDate: string; formattedTime: string } {
  const d = new Date(scheduledAt)
  const formattedDate = d.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const formattedTime = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  return { formattedDate, formattedTime }
}

interface EmailParams {
  clientName:      string
  clientEmail:     string
  therapistName:   string
  therapistEmail?: string | null
  meetLink?:       string | null
  serviceName?:    string | null
  scheduledAt:     string
  durationMins?:   number | null
}

/**
 * Sends the booking confirmation email to the client, and -- if the
 * therapist has an email on file -- a matching notification to the
 * therapist too. Uses the same SMTP/nodemailer setup as /api/contact.
 */
export async function sendBookingConfirmationEmails(params: EmailParams): Promise<void> {
  console.log('[booking-notifications] sendBookingConfirmationEmails() called with:', {
    clientEmail:    params.clientEmail,
    therapistEmail: params.therapistEmail,
    scheduledAt:    params.scheduledAt,
    hasMeetLink:    !!params.meetLink,
  })

  // Check SMTP env vars are actually present BEFORE trying to send --
  // this is the #1 reason emails silently don't go out.
  const smtpConfig = {
    host:   process.env.SMTP_HOST,
    port:   process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    user:   process.env.SMTP_USER,
    pass:   process.env.SMTP_PASS ? '(set)' : '(MISSING)',
  }
  console.log('[booking-notifications] SMTP config:', smtpConfig)
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('[booking-notifications] SMTP env vars missing -- emails will NOT send. Check .env.local / Azure app settings.')
  }

  const { formattedDate, formattedTime } = formatDateTime(params.scheduledAt)
  const sessionLabel = params.serviceName
    ? escapeHtml(params.serviceName)
    : 'Therapy Session'
  const durationLine = params.durationMins ? `${params.durationMins} minutes` : null

  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.default.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  const FROM = process.env.SMTP_FROM || 'Counsellors of India <support@counsellorsofindia.com>'

  function meetLinkBlock(): string {
    if (!params.meetLink) {
      return '<p style="color:#888">The meeting link will be shared closer to your session.</p>'
    }
    return `
      <p style="margin:20px 0">
        <a href="${escapeHtml(params.meetLink)}"
           style="background:#5a7f7a;color:#fff;padding:12px 24px;border-radius:8px;
                  text-decoration:none;font-weight:600;display:inline-block">
          Join Session
        </a>
      </p>
      <p style="color:#666;font-size:13px;word-break:break-all">${escapeHtml(params.meetLink)}</p>`
  }

  function detailsBlock(): string {
    return `
      <p><strong>Session:</strong> ${sessionLabel}</p>
      <p><strong>Date:</strong> ${escapeHtml(formattedDate)}</p>
      <p><strong>Time:</strong> ${escapeHtml(formattedTime)}</p>
      ${durationLine ? `<p><strong>Duration:</strong> ${escapeHtml(durationLine)}</p>` : ''}`
  }

  const sends: Promise<unknown>[] = []

  // ── Client email ──────────────────────────────────────────────────────
  sends.push(
    transporter.sendMail({
      from:    FROM,
      to:      params.clientEmail,
      subject: `Booking Confirmed: ${sessionLabel} with ${escapeHtml(params.therapistName)}`,
      html: `
<html><body style="font-family:sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a18">Your session is confirmed</h2>
  <p>Hi ${escapeHtml(params.clientName)},</p>
  <p>Your session with <strong>${escapeHtml(params.therapistName)}</strong> is confirmed.</p>
  ${detailsBlock()}
  ${meetLinkBlock()}
  <p style="color:#888;font-size:13px;margin-top:24px">Counsellors of India</p>
</body></html>`,
    }).then(info => {
      console.log('[booking-notifications] client email sent OK:', { to: params.clientEmail, messageId: info.messageId })
      return info
    }).catch(err => {
      console.error('[booking-notifications] client email FAILED:', { to: params.clientEmail, error: err?.message ?? err })
      throw err
    })
  )

  // ── Therapist email (only if we have one on file) ──────────────────────
  if (params.therapistEmail) {
    sends.push(
      transporter.sendMail({
        from:    FROM,
        to:      params.therapistEmail,
        subject: `New Booking: ${sessionLabel} with ${escapeHtml(params.clientName)}`,
        html: `
<html><body style="font-family:sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a18">New session booked</h2>
  <p>Hi ${escapeHtml(params.therapistName)},</p>
  <p><strong>${escapeHtml(params.clientName)}</strong> has booked a session with you.</p>
  ${detailsBlock()}
  ${meetLinkBlock()}
  <p style="color:#888;font-size:13px;margin-top:24px">Counsellors of India</p>
</body></html>`,
      }).then(info => {
        console.log('[booking-notifications] therapist email sent OK:', { to: params.therapistEmail, messageId: info.messageId })
        return info
      }).catch(err => {
        console.error('[booking-notifications] therapist email FAILED:', { to: params.therapistEmail, error: err?.message ?? err })
        throw err
      })
    )
  } else {
    console.warn('[booking-notifications] no therapist email on file -- skipping therapist email.')
  }

  await Promise.all(sends)
  console.log('[booking-notifications] sendBookingConfirmationEmails() finished.')
}

interface NotifyBookingConfirmedParams {
  /** Therapist's plan -- 'pro' sends WhatsApp, anything else (incl. missing) sends email. */
  plan:              string | null | undefined
  clientName:        string
  clientEmail:       string
  clientPhone?:      string | null
  therapistName:     string
  therapistEmail?:   string | null
  therapistPhone?:   string | null   // whatsapp number if set, else phone
  meetLink?:         string | null
  serviceName?:      string | null
  scheduledAt:       string
  durationMins?:     number | null
}

/**
 * Single entrypoint for "a booking just got confirmed, tell both people".
 * Picks the channel by plan and sends to both client + therapist on that
 * channel. Fire-and-forget -- callers should not await this inline in a
 * response path; wrap in the same non-blocking IIFE pattern used elsewhere
 * (or just call without awaiting).
 */
export async function notifyBookingConfirmed(params: NotifyBookingConfirmedParams): Promise<void> {
  const isPro = (params.plan ?? 'starter').toLowerCase() === 'pro'
  console.log('[booking-notifications] notifyBookingConfirmed() called:', {
    plan: params.plan,
    channel: isPro ? 'whatsapp' : 'email',
    clientEmail: params.clientEmail,
    clientPhone: params.clientPhone,
    therapistEmail: params.therapistEmail,
    therapistPhone: params.therapistPhone,
  })

  if (isPro) {
    const { formattedDate, formattedTime } = formatDateTime(params.scheduledAt)

    try {
      if (params.clientPhone) {
        await sendBookingConfirmation(params.clientPhone, {
          employeeName: params.clientName,
          doctorName:   params.therapistName,
          date:         formattedDate,
          time:         formattedTime,
          meetLink:     params.meetLink || undefined,
        })
      }
    } catch (e) {
      console.error('[booking-notifications] client WhatsApp failed:', e)
    }

    try {
      if (params.therapistPhone) {
        await sendTherapistBookingAlert(params.therapistPhone, {
          therapistName: params.therapistName,
          clientName:    params.clientName,
          date:          formattedDate,
          time:          formattedTime,
          clientPhone:   params.clientPhone || undefined,
        })
      }
    } catch (e) {
      console.error('[booking-notifications] therapist WhatsApp failed:', e)
    }
    return
  }

  // Starter (default) -- email both sides.
  try {
    await sendBookingConfirmationEmails({
      clientName:     params.clientName,
      clientEmail:    params.clientEmail,
      therapistName:  params.therapistName,
      therapistEmail: params.therapistEmail ?? null,
      meetLink:       params.meetLink ?? null,
      serviceName:    params.serviceName ?? null,
      scheduledAt:    params.scheduledAt,
      durationMins:   params.durationMins ?? null,
    })
  } catch (e) {
    console.error('[booking-notifications] email failed:', e)
  }
}
