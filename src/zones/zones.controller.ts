import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ZonesService } from './zones.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { AssignContainerDto } from './dto/assign-container.dto';

@ApiTags('zones')
@Controller('zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список всех зон' })
  @ApiResponse({ status: 200, description: 'Список зон успешно получен' })
  findAll() {
    return this.zonesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить зону по ID' })
  @ApiResponse({ status: 200, description: 'Зона найдена' })
  @ApiResponse({ status: 404, description: 'Зона не найдена' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.zonesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать новую зону' })
  @ApiResponse({ status: 201, description: 'Зона успешно создана' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  create(@Body() createZoneDto: CreateZoneDto) {
    return this.zonesService.create(createZoneDto);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Разместить контейнер в зону' })
  @ApiResponse({
    status: 200,
    description: 'Контейнер успешно размещен в зоне',
  })
  @ApiResponse({
    status: 400,
    description: 'Зона переполнена или неверные данные',
  })
  @ApiResponse({ status: 404, description: 'Зона или контейнер не найдены' })
  assignContainer(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignContainerDto: AssignContainerDto,
  ) {
    return this.zonesService.assignContainer(id, assignContainerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить зону' })
  @ApiResponse({ status: 204, description: 'Зона успешно удалена' })
  @ApiResponse({ status: 404, description: 'Зона не найдена' })
  @ApiResponse({ status: 400, description: 'В зоне находятся контейнеры' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.zonesService.remove(id);
  }
}
