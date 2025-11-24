import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Проверка базы данных...\n');

  try {
    // Проверяем зоны
    const zones = await prisma.zone.findMany({
      include: {
        _count: {
          select: { containers: true },
        },
      },
    });
    
    console.log('📦 ЗОНЫ:');
    zones.forEach((zone) => {
      console.log(
        `  - ${zone.name}: ${zone._count.containers}/${zone.capacity} контейнеров (${zone.type})`,
      );
    });
    
    // Проверяем контейнеры
    const containers = await prisma.container.findMany({
      include: {
        zone: true,
      },
    });
    
    console.log('\n🚛 КОНТЕЙНЕРЫ:');
    containers.forEach((container) => {
      const location = container.zone
        ? container.zone.name
        : 'Ожидание размещения';
      console.log(
        `  - ${container.number}: ${container.type} (${container.status}) - ${location}`,
      );
    });
    
    // Статистика
    const totalContainers = containers.length;
    const containersInStorage = containers.filter(
      (c) => c.status === 'IN_STORAGE',
    ).length;
    const containersArrived = containers.filter(
      (c) => c.status === 'ARRIVED',
    ).length;
    const containersShipped = containers.filter(
      (c) => c.status === 'SHIPPED',
    ).length;
    
    console.log('\n📊 СТАТИСТИКА:');
    console.log(`  - Всего контейнеров: ${totalContainers}`);
    console.log(`  - На складе: ${containersInStorage}`);
    console.log(`  - Прибыли: ${containersArrived}`);
    console.log(`  - Отгружены: ${containersShipped}`);
    console.log(`  - Всего зон: ${zones.length}`);
  } catch (error) {
    console.error('❌ Ошибка при проверке базы данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

void checkDatabase();
