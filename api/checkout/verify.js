import { createOrderNumber, ensureSchema, hashPassword, query, syncSeedProducts } from "../_lib/db.js";
import { sendOrderNotification } from "../_lib/mail.js";

const verifyUrl = "https://api.paystack.co/transaction/verify/";

async function verifyPaystack(reference) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  }

  const response = await fetch(`${verifyUrl}${reference}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });

  const data = await response.json();

  if (!response.ok || !data.status) {
    throw new Error(data.message || "Could not verify Paystack transaction.");
  }

  return data.data;
}

async function findOrCreateUser(customer, createAccount) {
  const existing = await query("SELECT id FROM users WHERE email = $1 LIMIT 1", [
    String(customer.email).toLowerCase(),
  ]);

  if (existing.rows.length) {
    return existing.rows[0].id;
  }

  if (!createAccount) {
    return null;
  }

  const temporaryPassword = `SolarMart-${Math.random().toString(36).slice(2, 10)}`;
  const passwordHash = await hashPassword(temporaryPassword);
  const result = await query(
    `INSERT INTO users (full_name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, 'customer')
     RETURNING id`,
    [customer.fullName, String(customer.email).toLowerCase(), customer.phone, passwordHash],
  );
  return result.rows[0].id;
}

async function resolveAffiliate(referralCode) {
  if (!referralCode) {
    return null;
  }

  const result = await query("SELECT * FROM affiliates WHERE code = $1 LIMIT 1", [
    String(referralCode).toUpperCase(),
  ]);

  return result.rows[0] || null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await ensureSchema();
    await syncSeedProducts();

    const { reference } = req.body || {};
    if (!reference) {
      return res.status(400).json({ message: "Payment reference is required." });
    }

    const existingOrder = await query("SELECT order_number, payment_status FROM orders WHERE payment_reference = $1", [
      reference,
    ]);

    if (existingOrder.rows.length) {
      return res.status(200).json({
        message: "Order already verified.",
        orderNumber: existingOrder.rows[0].order_number,
        paymentStatus: existingOrder.rows[0].payment_status,
      });
    }

    const payment = await verifyPaystack(reference);

    if (payment.status !== "success") {
      return res.status(400).json({
        message: "Payment has not completed successfully.",
        paymentStatus: payment.status,
      });
    }

    const customer = payment.metadata?.customer;
    const items = payment.metadata?.items || [];
    const totals = payment.metadata?.totals;
    const referralCode = payment.metadata?.referralCode || null;
    const createAccount = Boolean(payment.metadata?.createAccount);

    if (!customer || !items.length || !totals) {
      return res.status(400).json({
        message: "Payment metadata is incomplete for order creation.",
      });
    }

    const userId = await findOrCreateUser(customer, createAccount);
    const affiliate = await resolveAffiliate(referralCode);
    const commissionRate = affiliate ? Number(affiliate.commission_rate) : 0;
    const commissionAmount = affiliate ? (Number(totals.total) * commissionRate) / 100 : 0;
    const orderNumber = createOrderNumber();

    const orderResult = await query(
      `INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone, address, city,
        subtotal, delivery_fee, total, status, payment_status, payment_reference,
        payment_provider, referral_code, affiliate_id, commission_amount, metadata
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, 'processing', 'paid', $11,
        'paystack', $12, $13, $14, $15::jsonb
      )
      RETURNING id, order_number, total, customer_name, customer_email, customer_phone, referral_code, payment_reference`,
      [
        orderNumber,
        userId,
        customer.fullName,
        customer.email,
        customer.phone,
        customer.address,
        customer.city,
        totals.subtotal,
        totals.delivery,
        totals.total,
        reference,
        referralCode,
        affiliate?.id || null,
        commissionAmount,
        JSON.stringify({
          gatewayResponse: payment.gateway_response,
          paidAt: payment.paid_at,
        }),
      ],
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      const productResult = await query(
        "SELECT id FROM products WHERE external_id = $1 OR slug = $1 LIMIT 1",
        [item.id],
      );

      await query(
        `INSERT INTO order_items (order_id, product_id, external_product_id, name, price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          order.id,
          productResult.rows[0]?.id || null,
          item.id,
          item.name,
          item.price,
          item.quantity,
        ],
      );
    }

    if (affiliate) {
      await query(
        `INSERT INTO referrals (affiliate_id, code, order_id, status, commission_amount)
         VALUES ($1, $2, $3, 'converted', $4)`,
        [affiliate.id, affiliate.code, order.id, commissionAmount],
      );

      await query(
        `UPDATE affiliates
         SET total_conversions = total_conversions + 1,
             total_commission = total_commission + $2
         WHERE id = $1`,
        [affiliate.id, commissionAmount],
      );
    }

    await sendOrderNotification({
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      total: order.total,
      paymentReference: order.payment_reference,
      referralCode: order.referral_code,
    });

    return res.status(200).json({
      message: "Payment verified and order created.",
      orderNumber: order.order_number,
      total: Number(order.total),
    });
  } catch (error) {
    return res.status(500).json({
      message: "We could not verify this payment right now.",
      error: error.message,
    });
  }
}
