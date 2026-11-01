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
