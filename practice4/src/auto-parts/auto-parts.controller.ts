import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AutoPartsService } from './auto-parts.service';
import { CreateAutoPartDto } from './dto/create-auto-part.dto';
import { UpdateAutoPartDto } from './dto/update-auto-part.dto';

@Controller('auto-parts')
export class AutoPartsController {
  constructor(private readonly autoPartsService: AutoPartsService) {}

  @Get()
  findAll() {
    return this.autoPartsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.autoPartsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAutoPartDto: CreateAutoPartDto) {
    return this.autoPartsService.create(createAutoPartDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAutoPartDto: UpdateAutoPartDto,
  ) {
    return this.autoPartsService.update(id, updateAutoPartDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    this.autoPartsService.remove(id);
  }
}
