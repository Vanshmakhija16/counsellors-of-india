import axios from "axios";

const GETGABS_URL = "https://app.getgabs.com/whatsappbusiness/send-templated-message";


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
      campaign_id: process.env.GETGABS_CAMPAIGN_ID,

      messaging_product: "whatsapp",
      recipient_type: "individual",

      to: phone,

      type: "template",

      template: {
        name: "session_details",

        language: {
          code: "en",
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
                text:
                  meetLink ||
                  "Meeting link will be shared shortly",
              },
            ],
          },
        ],
      },
    };

    const response = await axios.post(
      GETGABS_URL,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "WhatsApp sent successfully:",
      response.data
    );

    return response.data;
  } catch (err) {
    console.error(
      "WhatsApp send error:",
      err
    );

    return null;
  }
};