import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AutoPartsService } from '../auto-parts/auto-parts.service';
import { STORE_CONFIG, StoreConfig } from '../shared/config/app-config.provider';
import { FEE_CALCULATOR, FeeCalculator } from '../shared/config/fee-calculator.provider';
import { CreateOrderDto } from './dto/create-order.dto';
@Injectable()
export class OrdersService implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);
  private readonly orders: object[] = [];
  constructor(private readonly parts: AutoPartsService, @Inject(STORE_CONFIG) private readonly config: StoreConfig, @Inject(FEE_CALCULATOR) private readonly fees: FeeCalculator) {}
  onModuleInit() { this.logger.log('Сервіс замовлень готовий до прийому замовлень.'); }
  createOrder(dto: CreateOrderDto) {
    const part = this.parts.findOne(dto.productId);
    const subtotal = Math.round(part.price * dto.quantity * 100) / 100;
    const taxAmount = this.fees.calculateTax(subtotal);
    const order = { orderId: randomUUID(), productId: part.id, productTitle: part.title, productSlug: part.slug, unitPrice: part.price, quantity: dto.quantity, subtotal, taxAmount, total: Math.round((subtotal + taxAmount) * 100) / 100, currency: this.config.defaultCurrency, status: 'confirmed', createdAt: new Date().toISOString() };
    this.orders.push(order); return order;
  }
  findAll() { return this.orders; }
}
