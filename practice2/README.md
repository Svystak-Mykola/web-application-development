# Практична робота № 2

**Тема:** Базові засоби системи типів TypeScript

**Варіант № 7** 

## Мета роботи

- Опанувати синтаксис та базові інструменти типізації мови TypeScript, налаштувати середовище проєкту із суворим режимом компіляції (`tsconfig.json`).
- Навчитися моделювати предметні області за допомогою примітивних типів, кортежів (tuples), псевдонімів типів (type aliases) та інтерфейсів (interfaces).
- Засвоїти механізми комбінування типів через об’єднання (unions) та перетин (intersections).
- Опанувати техніки звуження типів (type narrowing), роботу з розпізнаваними об’єднаннями (discriminated unions), розробку користувацьких захисників типу (custom type guards) та вичерпну перевірку (exhaustiveness check) через тип `never`.


## Хід виконання роботи

### Рівень 1. Базовий: структура проєкту та моделювання сутностей

#### 1. Ініціалізація робочого простору

Створення каталогу та ініціалізація `package.json`, встановлення залежностей розробки:

```bash
mkdir AutoParts
cd AutoParts
npm init -y
npm i -D typescript tsx @types/node
```

Результат у `package.json`:

```json
"devDependencies": {
  "@types/node": "^22.0.0",
  "tsx": "^4.20.0",
  "typescript": "^5.9.0"
}
```

Налаштування `tsconfig.json`:

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "types": ["node"],
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "sourceMap": true,
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

Команда `start` у `package.json`:

```json
"scripts": {
  "start": "tsx src/index.ts",
  "build": "tsc",
  "typecheck": "tsc --noEmit"
}
```

#### 2. Моделювання базових типів та інтерфейсів

Тип ідентифікатора сутності (union type):

```ts
type EntityId = string | number;
```

`EntityId` — union type, що дозволяє використовувати як рядковий (`"abc123"`), так і числовий (`42`) ідентифікатор. Це забезпечує сумісність з різними джерелами даних (БД, REST API тощо).

Базовий тип товару `BaseProduct`:

```ts
type BaseProduct = {
  readonly id: EntityId;
  title: string;
  price: number;
  description?: string;
  tags: string[];
  inStock: boolean;
};
```

- `readonly id` — поле лише для читання, не може бути змінене після створення об'єкта
- `description?` — опціональне поле (може бути відсутнє)
- `tags: string[]` — масив рядків для категоризації товару

Специфічний тип товару `Product` (Варіант 7 — автозапчастини):

```ts
type Product = BaseProduct & {
  vinCompatibility: string[];
  oemCode: string;
  condition: 'new' | 'refurbished';
};
```

`Product` розширює `BaseProduct` через intersection type (`&`) та додає специфічні для автозапчастин характеристики:

| Поле | Тип | Опис |
|---|---|---|
| `vinCompatibility` | `string[]` | Список VIN-кодів авто, з якими сумісна запчастина |
| `oemCode` | `string` | Оригінальний каталожний номер виробника |
| `condition` | `'new' \| 'refurbished'` | Стан запчастини (літеральний union type) |

#### 3. Базові функції обробки каталогу

Допоміжний тип `ProductData`:

```ts
type ProductData = Omit<Product, 'id'>;
```

Утиліта `Omit` виключає поле `id` з `Product`, оскільки ідентифікатор генерується всередині функції, а не передається ззовні.

Функція `createProduct`:

```ts
function createProduct(productData: ProductData): Product {
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
```

- Вхідний параметр `ProductData` — суворо типізований, `id` не передається
- Повернений тип `Product` вказано явно
- Валідація: від'ємна ціна, порожня назва та порожній `oemCode` кидають `Error`
- `id` генерується автоматично

Функція `calculateLineTotal`:

```ts
function calculateLineTotal(
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
```

- `discountPercent: number = 0` — дефолтний параметр (default parameter), знижка необов'язкова
- Формула: ціна × кількість × (1 − знижка / 100)
- Валідація `price`, `quantity` та `discountPercent` через `throw new Error`

### Рівень 2. Гнучка типізація (unions, intersections) та безпечне опрацювання

#### 1. Моделювання життєвого циклу замовлення

Літеральний тип статусів замовлення `OrderStatus`:

```ts
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
```

String literal union — TypeScript дозволяє лише ці п'ять значень. Будь-яке інше (`"done"`, `"active"`) дасть помилку компіляції.

Літеральний тип способів доставки `DeliveryMethod` (Варіант 7 — автозапчастини):

```ts
type DeliveryMethod = 'courier' | 'post_office' | 'auto_service_delivery';
```

| Значення | Опис |
|---|---|
| `courier` | Кур'єрська доставка |
| `post_office` | Доставка у поштове відділення |
| `auto_service_delivery` | Доставка в автосервіс |

Тип аудит-міток `TimestampMetadata`:

```ts
type TimestampMetadata = {
  readonly createdAt: Date;
  updatedAt: Date;
};
```

- `readonly createdAt` — встановлюється один раз при створенні, не може бути змінена
- `updatedAt` — оновлюється при кожній зміні замовлення

Інтерфейс позиції кошика `CartItem`:

```ts
interface CartItem {
  product: Product;
  quantity: number;
}
```

Повна модель замовлення `Order` через intersection:

```ts
type Order = TimestampMetadata & {
  readonly orderId: string;
  customerEmail: string;
  items: CartItem[];
  status: OrderStatus;
  delivery: DeliveryMethod;
};
```

`Order` формується через перетин типів (`&`) з `TimestampMetadata`. Це означає, що об'єкт `Order` зобов'язаний мати всі поля обох типів одночасно — `createdAt`, `updatedAt` плюс власні поля замовлення.

#### 2. Операції зі зміною стану замовлення

Функція `updateOrderStatus`:

```ts
const FINAL_STATUSES: readonly OrderStatus[] = ['cancelled', 'delivered'];

function updateOrderStatus(order: Order, newStatus: OrderStatus): Order {
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
```

- Чиста функція — не мутує вхідний `order`, повертає новий об'єкт через spread `{ ...order }`
- `FINAL_STATUSES` — константа термінальних статусів; зі `'cancelled'` та `'delivered'` перехід заборонений
- `updatedAt` актуалізується автоматично при кожному оновленні статусу
- `orderId` зберігається незмінним через `...order` — ідентифікатор замовлення не генерується повторно

#### 3. Безпечна обробка невідомих зовнішніх даних (type narrowing)

Функція `validateCustomerInput`:

```ts
function validateCustomerInput(input: unknown): string {
  if (typeof input !== 'string') {
    throw new TypeError(`Expected string, got ${typeof input}`);
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    throw new Error('Input cannot be empty');
  }
  if (!trimmed.includes('@')) {
    throw new Error('Invalid email format: missing "@"');
  }

  return trimmed;
}
```

- `input: unknown` — тип для будь-яких зовнішніх даних (форма, JSON-запит); на відміну від `any`, забороняє операції без попередньої перевірки
- `typeof input !== 'string'` — typeof narrowing: після цієї перевірки TypeScript звужує тип `input` з `unknown` до `string` у решті функції
- `TypeError` кидається при невірному типі (не рядок), `Error` — при невірному значенні (порожньо, немає `@`)
- `.trim()` очищує пробіли з країв — повертається вже очищений рядок

### Рівень 3. Просунутий: Discriminated Unions, Type Guards та Exhaustive Check

#### 1. Моделювання способів оплати через розпізнавані об'єднання (Discriminated Unions)

Три типи транзакцій зі спільним дискримінатором `type`:

```ts
type CreditCardPayment = {
  type: 'card';
  cardNumber: string;
  cardHolder: string;
  cvv: string;
};

type CashOnDeliveryPayment = {
  type: 'cash';
  cashAmountToPay: number;
};

type OnlineServicePayment = {
  type: 'online_service';
  serviceName: 'ApplePay' | 'GooglePay';
  transactionRef: string;
};
```

Union способів оплати:

```ts
type PaymentDetails =
  | CreditCardPayment
  | CashOnDeliveryPayment
  | OnlineServicePayment;
```

Поле `type` є дискримінатором — літеральне значення (`'card'`, `'cash'`, `'online_service'`), унікальне для кожного члена об'єднання. Завдяки цьому TypeScript автоматично звужує тип у `switch` / `if`-конструкціях без додаткових перевірок.

| Тип | Дискримінатор | Специфічні поля |
|---|---|---|
| `CreditCardPayment` | `type: 'card'` | `cardNumber`, `cardHolder`, `cvv` |
| `CashOnDeliveryPayment` | `type: 'cash'` | `cashAmountToPay` |
| `OnlineServicePayment` | `type: 'online_service'` | `serviceName`, `transactionRef` |

#### 2. Реалізація Custom Type Guard

Захисник типу `isCreditCardPayment`:

```ts
function isCreditCardPayment(
  payment: PaymentDetails
): payment is CreditCardPayment {
  return payment.type === 'card';
}
```

Повернення `payment is CreditCardPayment` — це предикат типу (type predicate). В runtime функція повертає звичайний `boolean`, але компілятор TypeScript використовує цю анотацію як сигнал: якщо функція повернула `true`, у відповідному блоці коду тип `payment` звужується до `CreditCardPayment`. Це дозволяє безпечно звертатись до `payment.cardNumber` без додаткових перевірок.

Функція маскування номера картки `maskCardNumber`:

```ts
function maskCardNumber(payment: PaymentDetails): string {
  if (isCreditCardPayment(payment)) {
    return '**** **** **** ' + payment.cardNumber.slice(-4);
  }
  return 'Не вимагає маскування';
}
```

- Викликає type guard `isCreditCardPayment` для звуження типу
- В блоці `if` TypeScript знає, що `payment` — це `CreditCardPayment`, тому `payment.cardNumber` доступний без помилки
- `slice(-4)` — повертає останні 4 символи рядка
- Для `CashOnDeliveryPayment` та `OnlineServicePayment` повертається інформаційне повідомлення

#### 3. Процесинг оплати з вичерпною перевіркою (Exhaustiveness checking)

Функція `processPayment`:

```ts
function processPayment(payment: PaymentDetails, amount: number): string {
  switch (payment.type) {
    case 'card':
      return `Успішно списано ${amount} грн з картки платника ${payment.cardHolder}.`;
    case 'cash':
      if (payment.cashAmountToPay > amount) {
        return `Підготуйте решту: ${payment.cashAmountToPay - amount} грн.`;
      }
      return `Точна сума готівки при отриманні: ${amount} грн.`;
    case 'online_service':
      return `Успішна авторизація через ${payment.serviceName} (${payment.transactionRef}). Сума: ${amount} грн.`;
    default: {
      const _exhaustiveCheck: never = payment;
      throw new Error(`Невідомий тип оплати: ${JSON.stringify(_exhaustiveCheck)}`);
    }
  }
}
```

- `switch (payment.type)` — TypeScript автоматично звужує тип `payment` у кожній гілці завдяки дискримінатору
- Гілка `'cash'` — два сценарії: якщо `cashAmountToPay > amount` — є решта, інакше точна сума
- Exhaustiveness check: у гілці `default` присвоєння `const _exhaustiveCheck: never = payment` є перевіркою вичерпності. Якщо до `default` дійде виконання — це означає, що з'явився новий тип оплати, який не був оброблений. TypeScript видасть помилку компіляції на цьому рядку, вказуючи саме на пропущений кейс

#### 4. Демонстрація роботи системи (`src/index.ts`)

Структура файлів проєкту:

```text
src/
├── models/
│   └── product.ts      # всі типи
├── utils/
│   ├── product.ts      # createProduct, calculateLineTotal
│   ├── order.ts        # updateOrderStatus
│   ├── payment.ts      # isCreditCardPayment, maskCardNumber, processPayment
│   └── validation.ts   # validateCustomerInput
└── index.ts            # точка входу — демонстрація
```

Створення тестових товарів:

```ts
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
```

Формування кошика та розрахунок вартості (перша позиція зі знижкою 10 %):

```ts
const cart: CartItem[] = [
  { product: brakePads, quantity: 2 },
  { product: oilFilter, quantity: 3 },
];

const discounts: number[] = [10, 0];
let cartTotal = 0;
cart.forEach((item, i) => {
  const line = calculateLineTotal(item.product.price, item.quantity, discounts[i]);
  cartTotal += line;
});
```

Зміна статусу замовлення:

```ts
const processing = updateOrderStatus(order, 'processing');
const shipped = updateOrderStatus(processing, 'shipped');
const delivered = updateOrderStatus(shipped, 'delivered');
```

Процесинг оплати трьома способами:

```ts
for (const payment of [cardPayment, cashPayment, onlinePayment]) {
  console.log(`Метод оплати: ${payment.type}`);
  console.log(`Маскування: ${maskCardNumber(payment)}`);
  console.log(`Результат: ${processPayment(payment, cartTotal)}\n`);
}
```

#### Результат виконання (`npm start`)

```text
=== СИСТЕМА ОБРОБКИ ЗАМОВЛЕНЬ (E-COMMERCE CORE) ===

[Каталог товарів]
- Створено товар #1: [Гальмівні колодки Brembo] - 1850 грн (В наявності: так)
  Специфікації: OEM: 1K0698151A, Стан: new, Сумісність (VIN): 2 шт.
- Створено товар #2: [Масляний фільтр Bosch] - 320 грн (В наявності: так)
  Специфікації: OEM: 03C115561D, Стан: new, Сумісність (VIN): 1 шт.
- Створено товар #3: [Генератор 120A] - 6400 грн (В наявності: ні)
  Специфікації: OEM: 06F903023F, Стан: refurbished, Сумісність (VIN): 1 шт.

[Формування кошика]
1. Гальмівні колодки Brembo x 2 = 3330 грн
2. Масляний фільтр Bosch x 3 = 960 грн
Загальна вартість замовлення: 4290 грн

[Створення замовлення]
Замовлення ID: ord-98214-abc
Клієнт: customer@example.com
Доставка: courier
Початковий статус: pending
Час створення: 2026-11-01T15:51:06.708Z

[Зміна життєвого циклу]
Оновлення статусу: pending -> processing (Оновлено: 2026-11-01T15:51:06.710Z)
Оновлення статусу: processing -> shipped (Оновлено: 2026-11-01T15:51:06.710Z)
Оновлення статусу: shipped -> delivered
Очікувана помилка: Cannot update order status: order is already "delivered"

[Валідація зовнішніх даних]
TypeError: Expected string, got number
Error: Input cannot be empty
Error: Invalid email format: missing "@"

[Процесинг платежу]
Метод оплати: card
Маскування: **** **** **** 8821
Результат: Успішно списано 4290 грн з картки платника John Doe.

Метод оплати: cash
Маскування: Не вимагає маскування
Результат: Підготуйте решту: 710 грн.

Метод оплати: online_service
Маскування: Не вимагає маскування
Результат: Успішна авторизація через GooglePay (TXN-98765). Сума: 4290 грн.
```


## Висновки

У ході виконання практичної роботи було опановано систему типів TypeScript на трьох рівнях складності:

- **Рівень 1** — налаштування проєкту з суворим режимом компіляції (`strict: true`), моделювання предметної області через type aliases та intersection types, реалізація базових функцій з явною типізацією параметрів і повернених значень
- **Рівень 2** — використання string literal union types для обмеження допустимих значень, побудова складених типів через `&`, реалізація чистих функцій, що не мутують вхідні дані, звуження типів (`typeof` narrowing) для безпечної обробки `unknown`
- **Рівень 3** — моделювання розпізнаваних об'єднань (discriminated unions) з полем-дискримінатором, написання користувацьких захисників типу (type guard з предикатом `p is T`), вичерпна перевірка (exhaustiveness check) через тип `never` у гілці `default`

## Лістинг

### src/models/product.ts

```ts
export type EntityId = string | number;

export type BaseProduct = {
  readonly id: EntityId;
  title: string;
  price: number;
  description?: string;
  tags: string[];
  inStock: boolean;
};

export type Product = BaseProduct & {
  vinCompatibility: string[];
  oemCode: string;
  condition: "new" | "refurbished";
};

export type ProductData = Omit<Product, "id">;

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type DeliveryMethod = "courier" | "post_office" | "auto_service_delivery";

export type TimestampMetadata = {
  readonly createdAt: Date;
  updatedAt: Date;
};

export interface CartItem {
  product: Product;
  quantity: number;
}

export type Order = TimestampMetadata & {
  readonly orderId: string;
  customerEmail: string;
  items: CartItem[];
  status: OrderStatus;
  delivery: DeliveryMethod;
};

export type CreditCardPayment = {
  type: "card";
  cardNumber: string;
  cardHolder: string;
  cvv: string;
};

export type CashOnDeliveryPayment = {
  type: "cash";
  cashAmountToPay: number;
};

export type OnlineServicePayment = {
  type: "online_service";
  serviceName: "ApplePay" | "GooglePay";
  transactionRef: string;
};

export type PaymentDetails =
  | CreditCardPayment
  | CashOnDeliveryPayment
  | OnlineServicePayment;
```

### src/utils/product.ts

```ts
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
```

### src/utils/order.ts

```ts
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
```

### src/utils/payment.ts

```ts
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
```

### src/utils/validation.ts

```ts
export function validateCustomerInput(input: unknown): string {
  if (typeof input !== "string") {
    throw new TypeError(`Expected string, got ${typeof input}`);
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    throw new Error("Input cannot be empty");
  }
  if (!trimmed.includes("@")) {
    throw new Error("Invalid email format: missing \"@\"");
  }

  return trimmed;
}
```

### src/index.ts

```ts
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
```

