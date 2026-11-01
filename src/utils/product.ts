import type { EntityId, Product, ProductData } from "../models/product.js";

export function createProduct(productData: ProductData): Product {
  if (productData.price < 0) {
    throw new Error("Product price cannot be negative");
  }
  if (productData.title.trim().length === 0) {
    throw new Error("Product title cannot be empty");
  }
  if (productData.oemCode.trim().length === 0) {
    throw new Error("Product oemCode cannot be empty");
  }

  const id: EntityId = Math.random().toString(36).substring(2, 9);

  return {
    id,
    ...productData,
  };
}

export function calculateLineTotal(
  price: number,
  quantity: number,
  discountPercent: number = 0
): number {
  if (price < 0) {
    throw new Error("Price cannot be negative");
  }
  if (quantity < 0) {
    throw new Error("Quantity cannot be negative");
  }
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error("Discount percent must be between 0 and 100");
  }

  const subtotal = price * quantity;
  const discount = subtotal * (discountPercent / 100);
  return subtotal - discount;
}
