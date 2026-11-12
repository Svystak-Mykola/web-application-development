import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AutoPart } from './auto-part.entity';
import { CreateAutoPartDto } from './dto/create-auto-part.dto';
import { UpdateAutoPartDto } from './dto/update-auto-part.dto';

@Injectable()
export class AutoPartsService {
  private items: AutoPart[] = [
    {
      id: '1',
      title: 'Гальмівні колодки Bosch',
      price: 1850,
      oemCode: 'BOSCH-BP-001',
      condition: 'new',
      carBrand: 'Volkswagen',
    },
    {
      id: '2',
      title: 'Генератор Valeo',
      price: 6200,
      oemCode: 'VALEO-ALT-002',
      condition: 'new',
      carBrand: 'Renault',
    },
    {
      id: '3',
      title: 'Амортизатор Sachs',
      price: 2750,
      oemCode: 'SACHS-SH-003',
      condition: 'refurbished',
      carBrand: 'BMW',
    },
  ];

  findAll(): AutoPart[] {
    return this.items;
  }

  findOne(id: string): AutoPart {
    const item = this.items.find((part) => part.id === id);

    if (!item) {
      throw new NotFoundException(`Сутність з ID ${id} не знайдена`);
    }

    return item;
  }

  create(dto: CreateAutoPartDto): AutoPart {
    const item: AutoPart = {
      id: randomUUID(),
      ...dto,
    };

    this.items.push(item);
    return item;
  }

  update(id: string, dto: UpdateAutoPartDto): AutoPart {
    const item = this.findOne(id);
    Object.assign(item, dto);
    return item;
  }

  remove(id: string): void {
    this.findOne(id);
    this.items = this.items.filter((part) => part.id !== id);
  }
}
