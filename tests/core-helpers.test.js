import test from "node:test";
import assert from "node:assert/strict";

import { computeTotals, validateCheckout } from "../api/store.js";
import { normalizeProductInput, slugify } from "../api/admin.js";
import { normalizeLead, validateLead } from "../api/lead.js";

test("validateCheckout rejects incomplete checkout payloads", () => {
  assert.equal(validateCheckout({}), "Customer name, phone, email, address, and city are required.");
  assert.equal(
    validateCheckout({ customer: { fullName: "A", phone: "1", email: "a@b.com", address: "Street" }, items: [] }),
    "Customer name, phone, email, address, and city are required.",
  );
  assert.equal(
    validateCheckout({
      customer: { fullName: "A", phone: "1", email: "a@b.com", address: "Street", city: "Lagos" },
      items: [{ id: "1", price: 100, quantity: 2 }],
    }),
    null,
  );
});

test("computeTotals calculates subtotal, delivery, and total", () => {
  assert.deepEqual(computeTotals([{ price: 1000, quantity: 2 }, { price: "500", quantity: 1 }]), {
    subtotal: 2500,
    delivery: 25000,
    total: 27500,
  });
});

test("slugify produces stable URL slugs", () => {
  assert.equal(slugify("SolarMart 5kVA Family Solar Kit"), "solarmart-5kva-family-solar-kit");
  assert.equal(slugify("  ---Special!! Item###  "), "special-item");
});

test("normalizeProductInput fills sensible defaults", () => {
  const product = normalizeProductInput({
    name: "SolarMart 3kVA Home Solar Kit",
    category: "Solar Kits",
    price: "1850000",
    stock: "8",
    imageUrl: "/image.svg",
    shortDescription: "Reliable backup power",
  });

  assert.equal(product.name, "SolarMart 3kVA Home Solar Kit");
  assert.equal(product.category, "Solar Kits");
  assert.equal(product.price, 1850000);
  assert.equal(product.stock, 8);
  assert.equal(product.slug, "solarmart-3kva-home-solar-kit");
  assert.equal(product.externalId, "sm-solarmart-3kva-home-solar-kit");
  assert.equal(product.images[0], "/image.svg");
  assert.equal(product.availability, "In stock");
});

test("normalizeLead and validateLead enforce required fields", () => {
  const lead = normalizeLead({
    name: "  Ada  ",
    phone: " 08012345678 ",
    location: " Lagos ",
    monthlyBill: "85000",
  });

  assert.deepEqual(lead, {
    name: "Ada",
    phone: "08012345678",
    location: "Lagos",
    monthlyBill: 85000,
    source: "website",
  });
  assert.equal(validateLead(lead), null);
  assert.equal(validateLead({ ...lead, location: "" }), "Name, phone, and location are required.");
});
