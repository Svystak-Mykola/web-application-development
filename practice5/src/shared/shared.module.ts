import { Module } from '@nestjs/common';
import { SlugService } from './slug.service';
import { AppConfigProvider, STORE_CONFIG } from './config/app-config.provider';
import { FeeCalculatorProvider, FEE_CALCULATOR } from './config/fee-calculator.provider';
import { RequestIdService } from './request-id.service';

@Module({
  providers: [
    SlugService,
    AppConfigProvider,
    FeeCalculatorProvider,
    RequestIdService,
  ],
  exports: [SlugService, STORE_CONFIG, FEE_CALCULATOR, RequestIdService],
})
export class SharedModule {}
