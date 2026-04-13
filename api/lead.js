import { applyCors } from "./_lib/cors.js";
import { readJsonBody } from "./_lib/request.js";

const resendUrl = "https://api.resend.com/emails";

export function normalizeLead(body = {}) {
  return {
    name: String(body.name || "").trim(),
    phone: String(body.phone || "").trim(),
    location: String(body.location || "").trim(),
    monthlyBill:
      body.monthlyBill === null || body.monthlyBill === undefined || body.monthlyBill === ""
        ? null
        : Number(body.monthlyBill),
    source: String(body.source || "website").trim(),
  };
}

export function validateLead(lead) {
  if (!lead.name || !lead.phone || !lead.location) {
    return "Name, phone, and location are required.";
  }

  if (lead.monthlyBill !== null && (!Number.isFinite(lead.monthlyBill) || lead.monthlyBill < 0)) {
    return "Monthly bill must be a valid number.";
  }

  return null;
}

async function sendLeadEmail(lead) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  const from = process.env.LEAD_FROM_EMAIL || "SolarMart Leads <onboarding@resend.dev>";

  if (!apiKey || !to) {
    return false;
  }

  const payload = {
    from,
    to: [to],
    subject: `New SolarMart lead from ${lead.name}`,
    text: [
      "New lead received from SolarMart website.",
      `Name: ${lead.name}`,
      `Phone: ${lead.phone}`,
      `Location: ${lead.location}`,
      `Monthly bill: ${lead.monthlyBill ?? "Not provided"}`,
      `Source: ${lead.source}`,
    ].join("\n"),
  };

  const response = await fetch(resendUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Email delivery failed: ${errorText}`);
  }

  return true;
}

async function forwardToWebhook(lead) {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;

  if (!webhookUrl) {
    return false;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...lead,
      receivedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Webhook delivery failed: ${errorText}`);
  }

  return true;
}

export default async function handler(req, res) {
  if (applyCors(req, res, "POST, OPTIONS")) {
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const lead = normalizeLead(await readJsonBody(req));
    const validationError = validateLead(lead);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const emailSent = await sendLeadEmail(lead);
    const webhookSent = await forwardToWebhook(lead);

    if (!emailSent && !webhookSent) {
      return res.status(503).json({
        message:
          "Lead delivery is not configured yet. Add RESEND_API_KEY and LEAD_NOTIFICATION_EMAIL, or set LEAD_WEBHOOK_URL.",
      });
    }

    return res.status(200).json({
      message: "Lead received successfully.",
      deliveredBy: {
        email: emailSent,
        webhook: webhookSent,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "We could not process this lead right now.",
      error: error.message,
    });
  }
}
