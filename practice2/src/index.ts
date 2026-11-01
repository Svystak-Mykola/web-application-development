import type { CartItem, Order, PaymentDetails } from './models/product.js';
import { calculateLineTotal, createProduct } from './utils/product.js';
import { updateOrderStatus } from './utils/order.js';
import { maskCardNumber, processPayment } from './utils/payment.js';
import { validateCustomerInput } from './utils/validation.js';

console.log('=== СИСТЕМА ОБРОБКИ ЗАМОВЛЕНЬ (E-COMMERCE CORE) ===\n');

console.log('[Каталог товарів]');

const brakePads = createProduct({
  title: 'Гальмівні колодки Brembo',
  price: 1850,
  description: 'Передні гальмівні колодки',
  tags: ['гальма', 'колодки'],
  inStock: true,
  vinCompatibility: ['WVWZZZ1KZAW000001', 'WVWZZZ1KZAW000002'],
  oemCode: '1K0698151A',
  condition: 'new',
});

const oilFilter = createProduct({
  title: 'Масляний фільтр Bosch',
  price: 320,
  tags: ['фільтри', 'масло'],
  inStock: true,
  vinCompatibility: ['WVWZZZ1KZAW000001'],
  oemCode: '03C115561D',
  condition: 'new',
});

const alternator = createProduct({
  title: 'Генератор 120A',
  price: 6400,
  tags: ['електрика', 'генератор'],
  inStock: false,
  vinCompatibility: ['WVWZZZ1KZAW000002'],
  oemCode: '06F903023F',
  condition: 'refurbished',
});

const catalog = [brakePads, oilFilter, alternator];
catalog.forEach((p, i) => {
  console.log(
    `- Створено товар #${i + 1}: [${p.title}] - ${p.price} грн (В наявності: ${p.inStock ? 'так' : 'ні'})`
  );
  console.log(
    `  Специфікації: OEM: ${p.oemCode}, Стан: ${p.condition}, Сумісність (VIN): ${p.vinCompatibility.length} шт.`
  );
});

console.log('\n[Формування кошика]');

const cart: CartItem[] = [
  { product: brakePads, quantity: 2 },
  { product: oilFilter, quantity: 3 },
];

const discounts: number[] = [10, 0];
let cartTotal = 0;
cart.forEach((item, i) => {
  const line = calculateLineTotal(item.product.price, item.quantity, discounts[i]);
  cartTotal += line;
  console.log(`${i + 1}. ${item.product.title} x ${item.quantity} = ${line} грн`);
});
console.log(`Загальна вартість замовлення: ${cartTotal} грн`);

console.log('\n[Створення замовлення]');

const email = validateCustomerInput('  customer@example.com ');
const now = new Date();
const order: Order = {
  orderId: 'ord-98214-abc',
  customerEmail: email,
  items: cart,
  status: 'pending',
  delivery: 'courier',
  createdAt: now,
  updatedAt: now,
};

console.log(`Замовлення ID: ${order.orderId}`);
console.log(`Клієнт: ${order.customerEmail}`);
console.log(`Доставка: ${order.delivery}`);
console.log(`Початковий статус: ${order.status}`);
console.log(`Час створення: ${order.createdAt.toISOString()}`);

console.log('\n[Зміна життєвого циклу]');

const processing = updateOrderStatus(order, 'processing');
console.log(
  `Оновлення статусу: ${order.status} -> ${processing.status} (Оновлено: ${processing.updatedAt.toISOString()})`
);
const shipped = updateOrderStatus(processing, 'shipped');
console.log(
  `Оновлення статусу: ${processing.status} -> ${shipped.status} (Оновлено: ${shipped.updatedAt.toISOString()})`
);
const delivered = updateOrderStatus(shipped, 'delivered');
console.log(`Оновлення статусу: ${shipped.status} -> ${delivered.status}`);

try {
  updateOrderStatus(delivered, 'pending');
} catch (e) {
  console.log(`Очікувана помилка: ${(e as Error).message}`);
}

console.log('\n[Валідація зовнішніх даних]');
for (const bad of [42, '   ', 'no-at-sign']) {
  try {
    validateCustomerInput(bad);
  } catch (e) {
    console.log(`${(e as Error).name}: ${(e as Error).message}`);
  }
}

console.log('\n[Процесинг платежу]');

const cardPayment: PaymentDetails = {
  type: 'card',
  cardNumber: '4111111111118821',
  cardHolder: 'John Doe',
  cvv: '123',
};
const cashPayment: PaymentDetails = { type: 'cash', cashAmountToPay: 5000 };
const onlinePayment: PaymentDetails = {
  type: 'online_service',
  serviceName: 'GooglePay',
  transactionRef: 'TXN-98765',
};

for (const payment of [cardPayment, cashPayment, onlinePayment]) {
  console.log(`Метод оплати: ${payment.type}`);
  console.log(`Маскування: ${maskCardNumber(payment)}`);
  console.log(`Результат: ${processPayment(payment, cartTotal)}\n`);
}
