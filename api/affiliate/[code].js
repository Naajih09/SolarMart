import { sampleAffiliateStats } from "../../src/store/catalog.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { code } = req.query || {};

  return res.status(200).json({
    affiliateCode: code || sampleAffiliateStats.affiliateCode,
    stats: sampleAffiliateStats,
  });
}
