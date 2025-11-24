import { IsEnum, IsOptional, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContainerStatus } from '@prisma/client';

export class UpdateContainerStatusDto {
  @ApiPropertyOptional({
    description: 'Новый статус контейнера',
    enum: ContainerStatus,
    example: ContainerStatus.IN_STORAGE,
  })
  @IsEnum(ContainerStatus)
  @IsOptional()
  status?: ContainerStatus;
}
