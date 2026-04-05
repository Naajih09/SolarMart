export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      message: "Cart is managed client-side for guest checkout in this MVP.",
      items: [],
    });
  }

  if (req.method === "POST") {
    return res.status(200).json({
      message: "Cart payload accepted client-side. Persist cart in PostgreSQL when backend credentials are added.",
      cart: req.body || {},
    });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ message: "Method not allowed" });
}
