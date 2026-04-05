import { sampleAffiliateStats } from "../../src/store/catalog.js";

function generateCode(name = "solar") {
  return String(name)
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 8)
    .toUpperCase() || "SOLARNEW";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required." });
  }

  return res.status(200).json({
    message: "Affiliate account created for MVP preview.",
    affiliate: {
      ...sampleAffiliateStats,
      affiliateCode: generateCode(name),
      email,
    },
  });
}
