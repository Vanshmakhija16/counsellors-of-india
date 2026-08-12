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
 *   - pro               -> WhatsApp AND email, to both client and therapist
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
  /** Amount the client paid, in rupees. Only shown in the THERAPIST email, and only when set (free sessions pass null/0). */
  amountPaid?:     number | null
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

  function detailsBlock(includePrice: boolean): string {
    return `
      ${params.serviceName ? `<p><strong>Session Type:</strong> ${escapeHtml(params.serviceName)}</p>` : ''}
      <p><strong>Date:</strong> ${escapeHtml(formattedDate)}</p>
      <p><strong>Time:</strong> ${escapeHtml(formattedTime)}</p>
      ${durationLine ? `<p><strong>Duration:</strong> ${escapeHtml(durationLine)}</p>` : ''}
      ${includePrice && params.amountPaid ? `<p><strong>Amount Paid:</strong> ₹${params.amountPaid.toLocaleString('en-IN')}</p>` : ''}`
  }

  const signOff = '<p style="margin-top:24px">With regards,<br/>Team Counsellors of India</p>'

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
  ${detailsBlock(false)}
  ${meetLinkBlock()}
  ${signOff}
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
  ${detailsBlock(true)}
  ${meetLinkBlock()}
  ${signOff}
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
  /** Amount the client paid, in rupees. Omit/null for free sessions. Shown to the therapist only. */
  amountPaid?:       number | null
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
    channel: isPro ? 'whatsapp + email' : 'email',
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
          meetLink:      params.meetLink || undefined,
        })
      }
    } catch (e) {
      console.error('[booking-notifications] therapist WhatsApp failed:', e)
    }
  }

  // Email always goes out too -- pro plan gets WhatsApp (above) AND email;
  // starter gets email only.
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
      amountPaid:     params.amountPaid ?? null,
    })
  } catch (e) {
    console.error('[booking-notifications] email failed:', e)
  }
}

interface NotifyBookingRescheduledParams {
  /** Therapist's plan -- 'pro' sends WhatsApp, anything else (incl. missing) sends email. */
  plan:            string | null | undefined
  clientName:      string
  clientEmail:     string
  clientPhone?:    string | null
  therapistName:   string
  therapistEmail?: string | null
  therapistPhone?: string | null
  meetLink?:       string | null
  serviceName?:    string | null
  /** The NEW date/time the session was moved to. */
  newScheduledAt:  string
  durationMins?:   number | null
}

/**
 * Tells BOTH client and therapist a session was rescheduled to a new time.
 * Same plan-based channel split as notifyBookingConfirmed (starter -> email,
 * pro -> WhatsApp), but always sends to both sides regardless of who
 * triggered the reschedule -- per product requirement, the therapist gets
 * their own confirmation too, not just the client.
 *
 * WhatsApp note: there is no separate Meta-approved "rescheduled" template
 * yet, so this reuses the existing booking_details / therapist_session_request
 * templates (same 4-5 params, now carrying the NEW time) -- the wording on
 * WhatsApp will read like a fresh booking, not explicitly "rescheduled",
 * until a dedicated template is submitted and approved.
 */
export async function notifyBookingRescheduled(params: NotifyBookingRescheduledParams): Promise<void> {
  const isPro = (params.plan ?? 'starter').toLowerCase() === 'pro'
  console.log('[booking-notifications] notifyBookingRescheduled() called:', {
    plan: params.plan,
    channel: isPro ? 'whatsapp + email' : 'email',
    newScheduledAt: params.newScheduledAt,
  })

  if (isPro) {
    const { formattedDate, formattedTime } = formatDateTime(params.newScheduledAt)

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
      console.error('[booking-notifications] reschedule client WhatsApp failed:', e)
    }

    try {
      if (params.therapistPhone) {
        await sendTherapistBookingAlert(params.therapistPhone, {
          therapistName: params.therapistName,
          clientName:    params.clientName,
          date:          formattedDate,
          time:          formattedTime,
          clientPhone:   params.clientPhone || undefined,
          meetLink:      params.meetLink || undefined,
        })
      }
    } catch (e) {
      console.error('[booking-notifications] reschedule therapist WhatsApp failed:', e)
    }
  }

  // Email always goes out too -- pro plan gets WhatsApp (above) AND email;
  // starter gets email only.
  const { formattedDate, formattedTime } = formatDateTime(params.newScheduledAt)
  const sessionLabel = params.serviceName ? escapeHtml(params.serviceName) : 'Therapy Session'
  const durationLine = params.durationMins ? `${params.durationMins} minutes` : null

  try {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.default.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    const FROM = process.env.SMTP_FROM || 'Counsellors of India <support@counsellorsofindia.com>'
    const signOff = '<p style="margin-top:24px">With regards,<br/>Team Counsellors of India</p>'

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
        ${params.serviceName ? `<p><strong>Session Type:</strong> ${escapeHtml(params.serviceName)}</p>` : ''}
        <p><strong>New Date:</strong> ${escapeHtml(formattedDate)}</p>
        <p><strong>New Time:</strong> ${escapeHtml(formattedTime)}</p>
        ${durationLine ? `<p><strong>Duration:</strong> ${escapeHtml(durationLine)}</p>` : ''}`
    }

    await Promise.all([
      transporter.sendMail({
        from: FROM,
        to:   params.clientEmail,
        subject: `Session Rescheduled: ${sessionLabel} with ${escapeHtml(params.therapistName)}`,
        html: `
<html><body style="font-family:sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a18">Your session has been rescheduled</h2>
  <p>Hi ${escapeHtml(params.clientName)},</p>
  <p>Your session with <strong>${escapeHtml(params.therapistName)}</strong> has been moved to a new time.</p>
  ${detailsBlock()}
  ${meetLinkBlock()}
  ${signOff}
</body></html>`,
      }).then(info => console.log('[booking-notifications] reschedule client email sent OK:', { to: params.clientEmail, messageId: info.messageId }))
        .catch(err => { console.error('[booking-notifications] reschedule client email FAILED:', err?.message ?? err); throw err }),

      ...(params.therapistEmail ? [
        transporter.sendMail({
          from: FROM,
          to:   params.therapistEmail,
          subject: `Session Rescheduled: ${sessionLabel} with ${escapeHtml(params.clientName)}`,
          html: `
<html><body style="font-family:sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a18">Session rescheduled</h2>
  <p>Hi ${escapeHtml(params.therapistName)},</p>
  <p>The session with <strong>${escapeHtml(params.clientName)}</strong> has been moved to a new time.</p>
  ${detailsBlock()}
  ${meetLinkBlock()}
  ${signOff}
</body></html>`,
        }).then(info => console.log('[booking-notifications] reschedule therapist email sent OK:', { to: params.therapistEmail, messageId: info.messageId }))
          .catch(err => { console.error('[booking-notifications] reschedule therapist email FAILED:', err?.message ?? err); throw err }),
      ] : []),
    ])
  } catch (e) {
    console.error('[booking-notifications] reschedule email failed:', e)
  }
}
