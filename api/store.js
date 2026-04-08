import { sendOrderNotification } from "./_lib/mail.js";
import { applyCors } from "./_lib/cors.js";
import { createOrderNumber, ensureSchema, hashPassword, mapProductRow, query } from "./_lib/db.js";
import { getQueryParam, readJsonBody } from "./_lib/request.js";

const paystackInitUrl = "https://api.paystack.co/transaction/initialize";
const paystackVerifyUrl = "https://api.paystack.co/transaction/verify/";

function validateCheckout(body = {}) {
  const { customer, items } = body;
  if (!customer?.fullName || !customer?.phone || !customer?.email || !customer?.address || !customer?.city) {
    return "Customer name, phone, email, address, and city are required.";
  }
  if (!Array.isArray(items) || !items.length) {
    return "At least one cart item is required for checkout.";
  }
  return null;
}

function computeTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const delivery = subtotal > 0 ? 25000 : 0;
  return { subtotal, delivery, total: subtotal + delivery };
}

async function initializePaystackOrder(payload) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  }
  const response = await fetch(paystackInitUrl, {
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
  return { paymentUrl: data.data.authorization_url, reference: data.data.reference };
}

async function verifyPaystack(reference) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  }
  const response = await fetch(`${paystackVerifyUrl}${reference}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
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
  const action = String(getQueryParam(req, "action") || "");

  if (applyCors(req, res, "GET, POST, OPTIONS")) {
    return;
  }

  try {
    await ensureSchema();

    if (req.method === "GET" && action === "products") {
      const category = getQueryParam(req, "category");
      const q = getQueryParam(req, "q");
      const sort = getQueryParam(req, "sort");
      const id = getQueryParam(req, "id");
      if (id) {
        const result = await query("SELECT * FROM products WHERE external_id = $1 OR slug = $1 LIMIT 1", [String(id)]);
        if (!result.rows.length) {
          return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({ product: mapProductRow(result.rows[0]) });
      }

      const params = [];
      const conditions = [];
      if (category) {
        params.push(String(category));
        conditions.push(`category = $${params.length}`);
      }
      if (q) {
        params.push(`%${String(q)}%`);
        conditions.push(`(name ILIKE $${params.length} OR brand ILIKE $${params.length} OR category ILIKE $${params.length})`);
      }
      const orderBy =
        sort === "price-low" ? "price ASC" :
        sort === "price-high" ? "price DESC" :
        sort === "rating" ? "rating DESC" :
        "created_at DESC";
      const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      const result = await query(`SELECT * FROM products ${whereClause} ORDER BY ${orderBy}`, params);
      return res.status(200).json({ products: result.rows.map(mapProductRow) });
    }

    if (req.method === "GET" && action === "metrics") {
      const [productCount, orderCount, affiliateCount] = await Promise.all([
        query("SELECT COUNT(*)::int AS count FROM products"),
        query("SELECT COUNT(*)::int AS count FROM orders WHERE payment_status = 'paid'"),
        query("SELECT COUNT(*)::int AS count FROM affiliates WHERE status = 'approved'"),
      ]);

      return res.status(200).json({
        metrics: {
          products: productCount.rows[0].count,
          paidOrders: orderCount.rows[0].count,
          approvedAffiliates: affiliateCount.rows[0].count,
        },
      });
    }

    if (req.method === "POST" && action === "checkout") {
      const body = await readJsonBody(req);
      const validationError = validateCheckout(body);
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }

      const { customer, items, referralCode, createAccount, password } = body;
      const totals = computeTotals(items);
      const callbackUrl = process.env.PAYSTACK_CALLBACK_URL || "https://solar-mart.vercel.app/checkout/success";

      if (createAccount) {
        if (!password || String(password).length < 8) {
          return res.status(400).json({ message: "Use at least 8 characters for the account password." });
        }
        const existing = await query("SELECT id FROM users WHERE email = $1 LIMIT 1", [String(customer.email).toLowerCase()]);
        if (!existing.rows.length) {
          const passwordHash = await hashPassword(password);
          await query(
            `INSERT INTO users (full_name, email, phone, password_hash, role)
             VALUES ($1, $2, $3, $4, 'customer')`,
            [customer.fullName, String(customer.email).toLowerCase(), customer.phone, passwordHash],
          );
        }
      }

      const paystack = await initializePaystackOrder({
        email: customer.email,
        amount: totals.total * 100,
        callback_url: callbackUrl,
        metadata: { customer, items, referralCode: referralCode || null, createAccount: Boolean(createAccount), totals },
      });

      return res.status(200).json({ message: "Checkout initialized successfully.", paymentUrl: paystack.paymentUrl, reference: paystack.reference, totals });
    }

    if (req.method === "POST" && action === "verify") {
      const { reference } = await readJsonBody(req);
      if (!reference) {
        return res.status(400).json({ message: "Payment reference is required." });
      }

      const existingOrder = await query("SELECT order_number, payment_status FROM orders WHERE payment_reference = $1", [reference]);
      if (existingOrder.rows.length) {
        return res.status(200).json({ message: "Order already verified.", orderNumber: existingOrder.rows[0].order_number, paymentStatus: existingOrder.rows[0].payment_status });
      }

      const payment = await verifyPaystack(reference);
      if (payment.status !== "success") {
        return res.status(400).json({ message: "Payment has not completed successfully.", paymentStatus: payment.status });
      }

      const customer = payment.metadata?.customer;
      const items = payment.metadata?.items || [];
      const totals = payment.metadata?.totals;
      const referralCode = payment.metadata?.referralCode || null;
      const createAccount = Boolean(payment.metadata?.createAccount);
      if (!customer || !items.length || !totals) {
        return res.status(400).json({ message: "Payment metadata is incomplete for order creation." });
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
          orderNumber, userId, customer.fullName, customer.email, customer.phone, customer.address, customer.city,
          totals.subtotal, totals.delivery, totals.total, reference, referralCode, affiliate?.id || null, commissionAmount,
          JSON.stringify({ gatewayResponse: payment.gateway_response, paidAt: payment.paid_at }),
        ],
      );

      const order = orderResult.rows[0];
      for (const item of items) {
        const productResult = await query("SELECT id FROM products WHERE external_id = $1 OR slug = $1 LIMIT 1", [item.id]);
        await query(
          `INSERT INTO order_items (order_id, product_id, external_product_id, name, price, quantity)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [order.id, productResult.rows[0]?.id || null, item.id, item.name, item.price, item.quantity],
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

      return res.status(200).json({ message: "Payment verified and order created.", orderNumber: order.order_number, total: Number(order.total) });
    }

    if (req.method === "GET" && action === "cart") {
      return res.status(200).json({ message: "Cart is managed client-side for guest checkout in this MVP.", items: [] });
    }

    if (req.method === "POST" && action === "cart") {
      return res.status(200).json({ message: "Cart payload accepted client-side.", cart: await readJsonBody(req) });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ message: "Store request failed.", error: error.message });
  }
}
