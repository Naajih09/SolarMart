export const company = {
  name: "SolarMart",
  tagline: "Solar Products, Systems, and Affiliate Earnings in One Marketplace",
  phone: "09074260871",
  email: "Naajihibnsiraj@gmail.com",
  whatsappNumber: "2349074260871",
  address: "Lagos, Nigeria",
};

export const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export const whatsappMessage = encodeURIComponent(
  "Hello SolarMart, I want to place an order and get support on the best solar product for my needs.",
);

export function formatNaira(value) {
  return currency.format(Number(value || 0));
}

export function getRecommendation(monthlyBill) {
  if (!monthlyBill || monthlyBill <= 0) {
    return {
      title: "Enter your monthly bill",
      copy: "We will estimate your energy spend and suggest a matching solar product setup.",
      suggestion: "Start with a product consultation.",
    };
  }

  if (monthlyBill < 40000) {
    return {
      title: "Starter home setup",
      copy: "A 3kVA home kit or inverter-plus-battery bundle should cover essential appliances.",
      suggestion: "Recommended product: 3kVA Home Solar Kit",
    };
  }

  if (monthlyBill < 120000) {
    return {
      title: "Family or small business setup",
      copy: "A 5kVA inverter or complete family kit is the strongest fit for moderate daily demand.",
      suggestion: "Recommended product: 5kVA Family Solar Kit",
    };
  }

  return {
    title: "Business-grade setup",
    copy: "You likely need a larger inverter, more battery storage, and a complete commercial-ready solar kit.",
    suggestion: "Recommended product: 10kVA Business Solar Kit",
  };
}
