import { Module } from '@nestjs/common';
import { AutoPartsModule } from '../auto-parts/auto-parts.module';
import { SharedModule } from '../shared/shared.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
@Module({ imports: [AutoPartsModule, SharedModule], providers: [OrdersService], controllers: [OrdersController] })
export class OrdersModule {}
