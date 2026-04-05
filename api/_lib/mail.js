const resendUrl = "https://api.resend.com/emails";

export async function sendOrderNotification(order) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  const from = process.env.LEAD_FROM_EMAIL || "SolarMart Orders <onboarding@resend.dev>";

  if (!apiKey || !to) {
    return false;
  }

  const response = await fetch(resendUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `New SolarMart order ${order.orderNumber}`,
      text: [
        "A new SolarMart order has been paid successfully.",
        `Order Number: ${order.orderNumber}`,
        `Customer: ${order.customerName}`,
        `Email: ${order.customerEmail}`,
        `Phone: ${order.customerPhone}`,
        `Total: ${order.total}`,
        `Reference: ${order.paymentReference}`,
        `Referral Code: ${order.referralCode || "None"}`,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend notification failed: ${errorText}`);
  }

  return true;
}
