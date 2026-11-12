import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { AutoPartsService } from './auto-parts.service';
import { AutoPartsController } from './auto-parts.controller';
@Module({ imports: [SharedModule], providers: [AutoPartsService], controllers: [AutoPartsController], exports: [AutoPartsService] })
export class AutoPartsModule {}
