import {
  PrismaClient,
  ContainerType,
  ContainerStatus,
  ZoneType,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Очищаем существующие данные
  console.log('🧹 Cleaning existing data...');
  await prisma.container.deleteMany();
  await prisma.zone.deleteMany();

  // Создаем зоны
  console.log('📦 Creating zones...');
  const zones = await Promise.all([
    prisma.zone.create({
      data: {
        name: 'Zone A - Standard',
        capacity: 50,
        type: ZoneType.STANDARD,
      },
    }),
    prisma.zone.create({
      data: {
        name: 'Zone B - Refrigerated',
        capacity: 30,
        type: ZoneType.REFRIGERATED,
      },
    }),
    prisma.zone.create({
      data: {
        name: 'Zone C - Hazardous',
        capacity: 20,
        type: ZoneType.HAZARDOUS,
      },
    }),
    prisma.zone.create({
      data: {
        name: 'Zone D - Customs',
        capacity: 40,
        type: ZoneType.CUSTOMS,
      },
    }),
  ]);

  console.log(`✅ Created ${zones.length} zones`);

  // Создаем контейнеры
  console.log('🚛 Creating containers...');
  const containers = await Promise.all([
    prisma.container.create({
      data: {
        number: 'CONT-001',
        type: ContainerType.DRY,
        status: ContainerStatus.ARRIVED,
      },
    }),
    prisma.container.create({
      data: {
        number: 'CONT-002',
        type: ContainerType.REFRIGERATED,
        status: ContainerStatus.ARRIVED,
      },
    }),
    prisma.container.create({
      data: {
        number: 'CONT-003',
        type: ContainerType.DRY,
        status: ContainerStatus.IN_STORAGE,
        zoneId: zones[0].id,
      },
    }),
    prisma.container.create({
      data: {
        number: 'CONT-004',
        type: ContainerType.OPEN_TOP,
        status: ContainerStatus.IN_STORAGE,
        zoneId: zones[0].id,
      },
    }),
    prisma.container.create({
      data: {
        number: 'CONT-005',
        type: ContainerType.TANK,
        status: ContainerStatus.ARRIVED,
      },
    }),
    prisma.container.create({
      data: {
        number: 'CONT-006',
        type: ContainerType.REFRIGERATED,
        status: ContainerStatus.IN_STORAGE,
        zoneId: zones[1].id,
      },
    }),
    prisma.container.create({
      data: {
        number: 'CONT-007',
        type: ContainerType.FLAT_RACK,
        status: ContainerStatus.SHIPPED,
      },
    }),
  ]);

  console.log(`✅ Created ${containers.length} containers`);

  // Обновляем current_load для зон с контейнерами
  console.log('🔄 Updating zone loads...');
  await Promise.all([
    prisma.zone.update({
      where: { id: zones[0].id },
      data: { currentLoad: 2 },
    }),
    prisma.zone.update({
      where: { id: zones[1].id },
      data: { currentLoad: 1 },
    }),
  ]);

  console.log('✅ Updated zone loads');
  console.log('🎉 Seeding completed successfully!');
  console.log(
    `📊 Summary: ${zones.length} zones, ${containers.length} containers created`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
