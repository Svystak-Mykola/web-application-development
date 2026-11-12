import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getInfo() {
    return {
      name: 'Practice 4',
      description: 'REST API для керування автозапчастинами',
      resource: '/auto-parts',
    };
  }
}
