import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignContainerDto {
  @ApiProperty({
    description: 'ID контейнера для размещения',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  containerId: number;
}
