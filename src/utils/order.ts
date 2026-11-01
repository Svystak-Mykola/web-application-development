import type { Order, OrderStatus } from "../models/product.js";

const FINAL_STATUSES: readonly OrderStatus[] = ["cancelled", "delivered"];

export function updateOrderStatus(order: Order, newStatus: OrderStatus): Order {
  if (FINAL_STATUSES.includes(order.status)) {
    throw new Error(
      `Cannot update order status: order is already "${order.status}"`
    );
  }

  return {
    ...order,
    status: newStatus,
    updatedAt: new Date(),
  };
}
