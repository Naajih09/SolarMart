import { createSessionForUser, loginUser } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await loginUser(email, password);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = await createSessionForUser(res, user);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not login.", error: error.message });
  }
}
