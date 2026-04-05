import { ensureSchema, hashPassword, query } from "./_lib/db.js";

const paystackUrl = "https://api.paystack.co/transaction/initialize";

function validateCheckout(body = {}) {
  const { customer, items } = body;

  if (!customer?.fullName || !customer?.phone || !customer?.email || !customer?.address || !customer?.city) {
    return "Customer name, phone, email, address, and city are required.";
  }

  if (!Array.isArray(items) || !items.length) {
    return "At least one cart item is required for checkout.";
  }

  const invalidItem = items.find(
    (item) =>
      !item?.id ||
      !item?.name ||
      !Number.isFinite(Number(item?.price)) ||
      !Number.isFinite(Number(item?.quantity)) ||
      Number(item.quantity) < 1,
  );

  if (invalidItem) {
    return "Cart items must include a valid id, name, price, and quantity.";
  }

  return null;
}

function computeTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const delivery = subtotal > 0 ? 25000 : 0;
  return {
    subtotal,
    delivery,
    total: subtotal + delivery,
  };
}

async function initializePaystackOrder(payload) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  }

  const response = await fetch(paystackUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.status) {
    throw new Error(data.message || "Paystack checkout initialization failed.");
  }

  return {
    paymentUrl: data.data.authorization_url,
    reference: data.data.reference,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await ensureSchema();
    const validationError = validateCheckout(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { customer, items, referralCode, createAccount, password } = req.body;
    const totals = computeTotals(items);
    const callbackUrl =
      process.env.PAYSTACK_CALLBACK_URL || "https://solar-mart.vercel.app/checkout/success";

    if (createAccount) {
      if (!password || String(password).length < 8) {
        return res.status(400).json({
          message: "Use at least 8 characters for the account password.",
        });
      }

      const existing = await query("SELECT id FROM users WHERE email = $1 LIMIT 1", [
        String(customer.email).toLowerCase(),
      ]);

      if (!existing.rows.length) {
        const passwordHash = await hashPassword(password);
        await query(
          `INSERT INTO users (full_name, email, phone, password_hash, role)
           VALUES ($1, $2, $3, $4, 'customer')`,
          [
            customer.fullName,
            String(customer.email).toLowerCase(),
            customer.phone,
            passwordHash,
          ],
        );
      }
    }

    const paystack = await initializePaystackOrder({
      email: customer.email,
      amount: totals.total * 100,
      callback_url: callbackUrl,
      metadata: {
        customer,
        items,
        referralCode: referralCode || null,
        createAccount: Boolean(createAccount),
        totals,
      },
    });

    return res.status(200).json({
      message: "Checkout initialized successfully.",
      paymentUrl: paystack.paymentUrl,
      reference: paystack.reference,
      totals,
    });
  } catch (error) {
    return res.status(500).json({
      message: "We could not initialize checkout right now.",
      error: error.message,
    });
  }
}
