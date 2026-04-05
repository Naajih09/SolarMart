export const company = {
  name: "SolarMart",
  tagline: "Reliable Solar Power Solutions",
  phone: "+234 801 234 5678",
  email: "hello@solarmart.energy",
  whatsappNumber: "2348012345678",
};

export const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export const whatsappMessage = encodeURIComponent(
  "Hello SolarMart, I calculated my electricity cost and I want a solar quote.",
);

export function formatNaira(value) {
  return currency.format(Number(value || 0));
}

export function getRecommendation(monthlyBill) {
  if (!monthlyBill || monthlyBill <= 0) {
    return "Enter your monthly bill to see the right solar recommendation.";
  }

  if (monthlyBill < 40000) {
    return "The 3kVA package is a strong starting point for smaller homes with essential appliances.";
  }

  if (monthlyBill < 120000) {
    return "The 5kVA package is likely the best fit for a family home or small business with moderate daily use.";
  }

  return "The 10kVA package is the best fit for heavier energy demand, offices, and businesses that need reliable all-day power.";
}
