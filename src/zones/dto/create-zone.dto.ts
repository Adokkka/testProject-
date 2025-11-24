import { IsString, IsInt, IsEnum, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ZoneType } from '@prisma/client';

export class CreateZoneDto {
  @ApiProperty({
    description: 'Название зоны',
    example: 'Zone A',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Вместимость зоны (количество контейнеров)',
    example: 100,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({
    description: 'Тип зоны',
    enum: ZoneType,
    example: ZoneType.STANDARD,
  })
  @IsEnum(ZoneType)
  type: ZoneType;
}
