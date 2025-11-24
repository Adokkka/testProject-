import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { AssignContainerDto } from './dto/assign-container.dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class ZonesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  async findAll() {
    return (this.prisma as any).zone.findMany({
      include: {
        containers: true,
      },
    });
  }

  async findOne(id: number) {
    const zone = await (this.prisma as any).zone.findUnique({
      where: { id },
      include: {
        containers: true,
      },
    });

    if (!zone) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }

    return zone;
  }

  async create(createZoneDto: CreateZoneDto) {
    const zone = await (this.prisma as any).zone.create({
      data: createZoneDto,
      include: {
        containers: true,
      },
    });

    // Emit websocket event for zone creation
    this.websocketGateway.emitZoneUpdate({
      id: zone.id,
      name: zone.name,
      capacity: zone.capacity,
      currentLoad: zone.currentLoad,
      type: zone.type,
    });

    return zone;
  }

  async assignContainer(
    zoneId: number,
    assignContainerDto: AssignContainerDto,
  ) {
    const { containerId } = assignContainerDto;

    // Get container with current zone
    const container = await (this.prisma as any).container.findUnique({
      where: { id: containerId },
      include: {
        zone: true,
      },
    });

    if (!container) {
      throw new NotFoundException(`Container with ID ${containerId} not found`);
    }

    // Check if container is already assigned to this zone
    if (container.zoneId && container.zoneId !== zoneId) {
      throw new BadRequestException(
        `Container is already assigned to zone ${container.zoneId}`,
      );
    }

    // Check if container is already in this zone
    if (container.zoneId === zoneId) {
      throw new BadRequestException('Container is already in this zone');
    }

    // Get target zone with containers
    const zone = await (this.prisma as any).zone.findUnique({
      where: { id: zoneId },
      include: {
        containers: true,
      },
    });

    if (!zone) {
      throw new NotFoundException(`Zone with ID ${zoneId} not found`);
    }

    // Check zone capacity
    if (zone.currentLoad >= zone.capacity) {
      throw new BadRequestException(`Zone ${zone.name} is at full capacity`);
    }

    // Use transaction to assign container to zone
    const updatedContainer = await (this.prisma as any).container.update({
      where: { id: containerId },
      data: {
        zoneId: zoneId,
        status: 'STORED',
      },
    });

    // Increment zone load
    await this.prisma.$executeRaw`
      UPDATE zones 
      SET current_load = current_load + 1 
      WHERE id = ${zoneId}
    `;

    // Emit websocket events
    this.websocketGateway.emitContainerUpdate({
      id: container.id,
      number: container.number,
      status: 'STORED',
      type: container.type,
      zoneId: zoneId,
    });

    const updatedZone = await (this.prisma as any).zone.findUnique({
      where: { id: zoneId },
    });

    this.websocketGateway.emitZoneUpdate({
      id: zoneId,
      name: zone.name,
      capacity: zone.capacity,
      currentLoad: updatedZone?.currentLoad || zone.currentLoad + 1,
      type: zone.type,
    });

    return updatedContainer;
  }

  async remove(id: number) {
    const zone = await (this.prisma as any).zone.findUnique({
      where: { id },
      include: {
        containers: true,
      },
    });

    if (!zone) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }

    // Check if zone has containers
    if (zone.currentLoad > 0) {
      throw new BadRequestException(
        `Cannot delete zone with ${zone.currentLoad} containers inside`,
      );
    }

    await (this.prisma as any).zone.delete({
      where: { id },
    });

    // Emit websocket event for zone deletion
    this.websocketGateway.emitZoneUpdate({
      id: zone.id,
      name: zone.name,
      capacity: zone.capacity,
      currentLoad: zone.currentLoad,
      type: zone.type,
      deleted: true,
    });

    return { message: `Zone with ID ${id} deleted successfully` };
  }
}
