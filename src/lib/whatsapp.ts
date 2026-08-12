import axios from "axios";

const GETGABS_URL = "https://app.getgabs.com/whatsappbusiness/send-templated-message";

// Retries transient failures (429 rate-limits, 5xx) with backoff.
// Non-retryable errors (400s like a bad template/payload) are thrown
// immediately on the first attempt — no point retrying those.
async function postWithRetry(url: string, payload: unknown, maxRetries = 3) {
  let attempt = 0

  while (true) {
    try {
      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      })
      return response.data
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      const isRetryable = status === 429 || (status !== undefined && status >= 500)

      if (!isRetryable || attempt >= maxRetries) {
        throw err
      }

      // Respect the API's own Retry-After header when it sends one,
      // otherwise fall back to exponential backoff (1s, 2s, 4s… capped at 8s).
      const retryAfterHeader = axios.isAxiosError(err)
        ? err.response?.headers?.["retry-after"]
        : undefined
      const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : null
      const backoffMs = retryAfterMs ?? Math.min(1000 * 2 ** attempt, 8000)

      console.warn(
        `WhatsApp send got ${status}, retrying (${attempt + 1}/${maxRetries}) in ${backoffMs}ms`
      )
      await new Promise((resolve) => setTimeout(resolve, backoffMs))
      attempt += 1
    }
  }
}


export const sendBookingConfirmation = async (
  fullPhone: string,
  bookingDetails: {
    employeeName: string;
    doctorName: string;
    date: string;
    time: string;
    meetLink?: string;
  }
) => {
  try {
    // normalize phone
    let phone = String(fullPhone).replace(/\D/g, "");

    if (phone.length === 10) {
      phone = "91" + phone;
    }

    const {
      employeeName,
      doctorName,
      date,
      time,
      meetLink,
    } = bookingDetails;

    // validation
    if (!employeeName || !doctorName || !date || !time) {
      console.error("Invalid WhatsApp payload");
      return null;
    }

    const payload = {
      api_key: process.env.GETGABS_API_KEY,
      sender: process.env.GETGABS_SENDER,
      campaign_id: process.env.GETGABS_CLIENT_CAMPAIGN_ID,

      messaging_product: "whatsapp",
      recipient_type: "individual",

      to: phone,

      type: "template",

      template: {
        name: "booking_details",

        language: {
          code: "en_US",
        },

        components: [
          {
            type: "body",

            parameters: [
              {
                type: "text",
                text: employeeName,
              },

              {
                type: "text",
                text: doctorName,
              },

              {
                type: "text",
                text: date,
              },

              {
                type: "text",
                text: time,
              },

              {
                type: "text",
                // Template's {{5}} "Session Link" -- WhatsApp templates
                // reject empty params, so fall back to placeholder text
                // when a meet link isn't set yet.
                text: meetLink || "Link will be shared before your session",
              },
            ],
          },
        ],
      },
    };

    const data = await postWithRetry(GETGABS_URL, payload);

    console.log(
      "WhatsApp sent successfully:",
      data
    );

    return data;
  } catch (err) {
    console.error(
      "WhatsApp send error:",
      err
    );

    return null;
  }
};

// ── Therapist-facing booking request alert ──────────────────────────────
// Uses its own dedicated, Meta-approved "therapist_session_request"
// template (separate from the client-facing "booking_details" template
// above), sent under its own GetGabs campaign
// (GETGABS_THERAPIST_CAMPAIGN_ID). The 6 body params: therapist's own
// name, the client's name, date, time, client's phone number, and the
// meeting link.
export const sendTherapistBookingAlert = async (
  fullPhone: string,
  requestDetails: {
    therapistName: string;
    clientName: string;
    date: string;
    time: string;
    clientPhone?: string;
    meetLink?: string;
  }
) => {
  try {
    let phone = String(fullPhone).replace(/\D/g, "");
    if (phone.length === 10) {
      phone = "91" + phone;
    }

    const { therapistName, clientName, date, time, clientPhone, meetLink } = requestDetails;

    if (!therapistName || !clientName || !date || !time) {
      console.error("Invalid WhatsApp payload (therapist alert)");
      return null;
    }

    const payload = {
      api_key: process.env.GETGABS_API_KEY,
      sender: process.env.GETGABS_SENDER,
      campaign_id: process.env.GETGABS_THERAPIST_CAMPAIGN_ID,

      messaging_product: "whatsapp",
      recipient_type: "individual",

      to: phone,

      type: "template",

      template: {
        name: "therapist_session_request",

        language: {
          code: "en_US",
        },

        components: [
          {
            type: "body",

            parameters: [
              { type: "text", text: therapistName },
              { type: "text", text: clientName },
              { type: "text", text: date },
              { type: "text", text: time },
              {
                type: "text",
                text: clientPhone ? `Client contact: ${clientPhone}` : "Client contact not provided",
              },
              {
                type: "text",
                // Template's {{6}} "Meet Link"-- must not be empty.
                text: meetLink || "Link will be shared before the session",
              },
            ],
          },
        ],
      },
    };

    const data = await postWithRetry(GETGABS_URL, payload);

    console.log(
      "WhatsApp (therapist alert) sent successfully:",
      data
    );

    return data;
  } catch (err) {
    console.error(
      "WhatsApp send error (therapist alert):",
      err
    );

    return null;
  }
};