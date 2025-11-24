import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContainersService } from './containers.service';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerStatusDto } from './dto/update-container-status.dto';

@ApiTags('containers')
@Controller('containers')
export class ContainersController {
  constructor(private readonly containersService: ContainersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список всех контейнеров' })
  @ApiResponse({
    status: 200,
    description: 'Список контейнеров успешно получен',
  })
  findAll() {
    return this.containersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить контейнер по ID' })
  @ApiResponse({ status: 200, description: 'Контейнер найден' })
  @ApiResponse({ status: 404, description: 'Контейнер не найден' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.containersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать новый контейнер' })
  @ApiResponse({ status: 201, description: 'Контейнер успешно создан' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  create(@Body() createContainerDto: CreateContainerDto) {
    return this.containersService.create(createContainerDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить статус контейнера' })
  @ApiResponse({ status: 200, description: 'Контейнер успешно обновлен' })
  @ApiResponse({ status: 404, description: 'Контейнер не найден' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContainerDto: UpdateContainerStatusDto,
  ) {
    return this.containersService.updateStatus(id, updateContainerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить контейнер' })
  @ApiResponse({ status: 204, description: 'Контейнер успешно удален' })
  @ApiResponse({ status: 404, description: 'Контейнер не найден' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.containersService.remove(id);
  }
}
