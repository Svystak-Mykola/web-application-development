import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { AutoPartsService } from './auto-parts.service';
import { RequestIdService } from '../shared/request-id.service';
import { CreateAutoPartDto } from './dto/create-auto-part.dto';
import { UpdateAutoPartDto } from './dto/update-auto-part.dto';
@Controller('auto-parts')
export class AutoPartsController {
  constructor(private readonly service: AutoPartsService, private readonly requestId: RequestIdService) {}
  @Get('request-id') requestScope() { return { requestId: this.requestId.id }; }
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateAutoPartDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateAutoPartDto) { return this.service.update(id, dto); }
  @Delete(':id') @HttpCode(204) remove(@Param('id') id: string) { this.service.remove(id); }
}
