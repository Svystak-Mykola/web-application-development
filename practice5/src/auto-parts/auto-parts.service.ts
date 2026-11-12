import { Injectable, Logger, NotFoundException, OnModuleInit, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SlugService } from '../shared/slug.service';
import { AutoPartEntity } from './auto-part.entity';
import { CreateAutoPartDto } from './dto/create-auto-part.dto';
import { UpdateAutoPartDto } from './dto/update-auto-part.dto';
@Injectable()
export class AutoPartsService implements OnModuleInit {
  private readonly logger = new Logger(AutoPartsService.name);
  private readonly parts: AutoPartEntity[] = [];
  constructor(private readonly slugService: SlugService) {}
  onModuleInit() {
    if (this.parts.length) return;
    this.parts.push(
      { id: '1', title: 'Гальмівні колодки Bosch', price: 1200, oemCode: 'BOS-001', condition: 'new', carBrand: 'Volkswagen', slug: this.slugService.generateSlug('Гальмівні колодки Bosch') },
      { id: '2', title: 'Генератор Valeo', price: 4500, oemCode: 'VAL-002', condition: 'new', carBrand: 'Renault', slug: this.slugService.generateSlug('Генератор Valeo') },
    );
    this.logger.log('Ініціалізація модуля завершена. Завантажено початкові тестові дані.');
  }
  findAll() { return this.parts; }
  findOne(id: string): AutoPartEntity { const part = this.parts.find(x => x.id === id); if (!part) throw new NotFoundException('Автозапчастину не знайдено'); return part; }
  create(dto: CreateAutoPartDto) {
    const slug = this.slugService.generateSlug(dto.title);
    if (!slug) throw new BadRequestException('Некоректна назва');
    const part = { ...dto, id: randomUUID(), slug };
    this.parts.push(part); return part;
  }
  update(id: string, dto: UpdateAutoPartDto) {
    const part = this.findOne(id);
    if (dto.title !== undefined) { const slug = this.slugService.generateSlug(dto.title); if (!slug) throw new BadRequestException('Некоректна назва'); part.slug = slug; }
    Object.assign(part, dto); return part;
  }
  remove(id: string) { const part = this.findOne(id); this.parts.splice(this.parts.indexOf(part), 1); }
}
