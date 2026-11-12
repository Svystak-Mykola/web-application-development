import { Module } from '@nestjs/common';
import { AutoPartsModule } from './auto-parts/auto-parts.module';
import { OrdersModule } from './orders/orders.module';
import { SharedModule } from './shared/shared.module';
@Module({ imports: [SharedModule, AutoPartsModule, OrdersModule] })
export class AppModule {}
