import type { CreditCardPayment, PaymentDetails } from "../models/product.js";

export function isCreditCardPayment(
  payment: PaymentDetails
): payment is CreditCardPayment {
  return payment.type === "card";
}

export function maskCardNumber(payment: PaymentDetails): string {
  if (isCreditCardPayment(payment)) {
    return "**** **** **** " + payment.cardNumber.slice(-4);
  }
  return "Не вимагає маскування";
}

export function processPayment(payment: PaymentDetails, amount: number): string {
  switch (payment.type) {
    case "card":
      return `Успішно списано ${amount} грн з картки платника ${payment.cardHolder}.`;
    case "cash":
      if (payment.cashAmountToPay > amount) {
        return `Підготуйте решту: ${payment.cashAmountToPay - amount} грн.`;
      }
      return `Точна сума готівки при отриманні: ${amount} грн.`;
    case "online_service":
      return `Успішна авторизація через ${payment.serviceName} (${payment.transactionRef}). Сума: ${amount} грн.`;
    default: {
      const _exhaustiveCheck: never = payment;
      throw new Error(`Невідомий тип оплати: ${JSON.stringify(_exhaustiveCheck)}`);
    }
  }
}
