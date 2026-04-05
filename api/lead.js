export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, phone, location, monthlyBill, source } = req.body || {};

  if (!name || !phone || !location) {
    return res.status(400).json({
      message: "Name, phone, and location are required.",
    });
  }

  return res.status(200).json({
    message: "Lead received successfully.",
    lead: {
      name,
      phone,
      location,
      monthlyBill: monthlyBill || null,
      source: source || "website",
      receivedAt: new Date().toISOString(),
    },
  });
}
