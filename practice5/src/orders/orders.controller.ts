import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Post() create(@Body() dto: CreateOrderDto) { return this.service.createOrder(dto); }
}
