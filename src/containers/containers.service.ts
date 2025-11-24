import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerStatusDto } from './dto/update-container-status.dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class ContainersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  async findAll() {
    return (this.prisma as any).container.findMany({
      include: {
        zone: true,
      },
    });
  }

  async findOne(id: number) {
    const container = await (this.prisma as any).container.findUnique({
      where: { id },
      include: {
        zone: true,
      },
    });

    if (!container) {
      throw new NotFoundException(`Container with ID ${id} not found`);
    }

    return container;
  }

  async create(createContainerDto: CreateContainerDto) {
    const { zoneId, ...containerData } = createContainerDto;

    // Check if zone exists and has capacity if zoneId is provided
    if (zoneId) {
      const zone = await (this.prisma as any).zone.findUnique({
        where: { id: zoneId },
      });

      if (!zone) {
        throw new NotFoundException(`Zone with ID ${zoneId} not found`);
      }

      if (zone.currentLoad >= zone.capacity) {
        throw new BadRequestException(`Zone ${zone.name} is at full capacity`);
      }
    }

    const container = await (this.prisma as any).container.create({
      data: {
        number: containerData.number,
        type: containerData.type,
        status: containerData.status || (zoneId ? 'STORED' : 'ARRIVED'),
        zoneId: zoneId || null,
      },
      include: {
        zone: true,
      },
    });

    // Update zone load if container is assigned to a zone
    if (zoneId) {
      await this.prisma.$executeRaw`
        UPDATE zones 
        SET current_load = current_load + 1 
        WHERE id = ${zoneId}
      `;

      // Emit websocket event for zone update
      this.websocketGateway.emitZoneUpdate({
        id: container.id,
        number: container.number,
        status: container.status,
        type: container.type,
        zoneId: container.zoneId,
      });
    }

    // Emit websocket event for container creation
    this.websocketGateway.emitContainerUpdate({
      id: container.id,
      number: container.number,
      status: container.status,
      type: container.type,
      zoneId: container.zoneId || undefined,
      arrivalTime: container.arrivalTime,
    });

    return container;
  }

  async updateStatus(
    id: number,
    updateContainerStatusDto: UpdateContainerStatusDto,
  ) {
    const container = await (this.prisma as any).container.findUnique({
      where: { id },
      include: {
        zone: true,
      },
    });

    if (!container) {
      throw new NotFoundException(`Container with ID ${id} not found`);
    }

    // If container is being removed from zone, decrement zone load
    if (container.zoneId) {
      await this.prisma.$executeRaw`
        UPDATE zones 
        SET current_load = current_load - 1 
        WHERE id = ${container.zoneId}
      `;
    }

    const updatedContainer = await (this.prisma as any).container.update({
      where: { id },
      data: {
        status: updateContainerStatusDto.status,
        zoneId: null, // Remove from zone when status is updated
      },
      include: {
        zone: true,
      },
    });

    // Emit websocket event for container update
    this.websocketGateway.emitContainerUpdate({
      id: updatedContainer.id,
      number: updatedContainer.number,
      status: updatedContainer.status,
      type: updatedContainer.type,
      zoneId: updatedContainer.zoneId || undefined,
      arrivalTime: updatedContainer.arrivalTime,
    });

    return updatedContainer;
  }

  async remove(id: number) {
    const container = await (this.prisma as any).container.findUnique({
      where: { id },
      include: {
        zone: true,
      },
    });

    if (!container) {
      throw new NotFoundException(`Container with ID ${id} not found`);
    }

    // Update zone load if container was in a zone
    if (container.zoneId && container.status !== 'SHIPPED') {
      await this.prisma.$executeRaw`
        UPDATE zones 
        SET current_load = current_load - 1 
        WHERE id = ${container.zoneId}
      `;
    }

    await (this.prisma as any).container.delete({
      where: { id },
    });

    // Emit websocket event for container deletion
    this.websocketGateway.emitContainerUpdate({
      id: container.id,
      number: container.number,
      status: container.status,
      type: container.type,
      zoneId: container.zoneId || undefined,
      arrivalTime: container.arrivalTime,
    });

    return { message: `Container with ID ${id} deleted successfully` };
  }
}
