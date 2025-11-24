import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ContainersModule } from './containers/containers.module';
import { ZonesModule } from './zones/zones.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [PrismaModule, ContainersModule, ZonesModule, WebsocketModule],
})
export class AppModule {}
