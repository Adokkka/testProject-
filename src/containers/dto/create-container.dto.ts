import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContainerType, ContainerStatus } from '@prisma/client';

export class CreateContainerDto {
  @ApiProperty({
    description: 'Уникальный номер контейнера',
    example: 'CONT-001',
  })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({
    description: 'Тип контейнера',
    enum: ContainerType,
    example: ContainerType.DRY,
  })
  @IsEnum(ContainerType)
  type: ContainerType;

  @ApiPropertyOptional({
    description: 'Статус контейнера',
    enum: ContainerStatus,
    example: ContainerStatus.ARRIVED,
    default: ContainerStatus.ARRIVED,
  })
  @IsEnum(ContainerStatus)
  @IsOptional()
  status?: ContainerStatus;

  @ApiPropertyOptional({
    description: 'ID зоны хранения',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  zoneId?: number;
}
