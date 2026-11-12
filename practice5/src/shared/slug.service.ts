import { Injectable } from '@nestjs/common';
@Injectable()
export class SlugService {
  generateSlug(title: string): string {
    return title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
  }
}
