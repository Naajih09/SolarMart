import { products } from "../../src/store/catalog.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { category, q, sort } = req.query || {};
  let items = [...products];

  if (category) {
    items = items.filter((product) => product.category.toLowerCase() === String(category).toLowerCase());
  }

  if (q) {
    const term = String(q).toLowerCase();
    items = items.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term),
    );
  }

  if (sort === "price-low") {
    items.sort((a, b) => a.price - b.price);
  } else if (sort === "price-high") {
    items.sort((a, b) => b.price - a.price);
  } else if (sort === "rating") {
    items.sort((a, b) => b.rating - a.rating);
  }

  return res.status(200).json({ products: items });
}
