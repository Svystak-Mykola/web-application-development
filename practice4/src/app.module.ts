import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AutoPartsController } from './auto-parts/auto-parts.controller';
import { AutoPartsService } from './auto-parts/auto-parts.service';

@Module({
  controllers: [AppController, AutoPartsController],
  providers: [AutoPartsService],
})
export class AppModule {}
