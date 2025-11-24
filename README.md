# testProject
# Container Management System API

REST API для учёта контейнеров и зон хранения с поддержкой WebSocket и Swagger документацией.

## 🚀 Технологический стек

- **Node.js** + **NestJS** - backend framework
- **PostgreSQL** - база данных
- **Prisma** - ORM
- **WebSocket** - real-time уведомления
- **Swagger** - API документация
- **Docker** + **Docker Compose** - контейнеризация

## 📋 Требования

- Docker и Docker Compose
- Node.js 18+ (для локальной разработки)
- npm или yarn

## 🛠️ Установка и запуск

### Вариант 1: Запуск через Docker (рекомендуется)

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd container-management-api
```

2. Создайте файл `.env`:
```bash
cp .env.example .env
```

3. Запустите приложение:
```bash
docker-compose up -d
```

4. Примените миграции БД:
```bash
docker-compose exec app npx prisma migrate deploy
```

5. (Опционально) Заполните БД тестовыми данными:
```bash
docker-compose exec app npx prisma db seed
```

### Вариант 2: Локальный запуск

1. Установите зависимости:
```bash
npm install
```

2. Настройте `.env` файл с вашими параметрами PostgreSQL

3. Примените миграции:
```bash
npx prisma migrate dev
```

4. Запустите приложение:
```bash
npm run start:dev
```

## 🌐 Доступ к приложению

- **API**: http://localhost:3000
- **Swagger документация**: http://localhost:3000/docs
- **WebSocket**: ws://localhost:3000

## 📚 API Endpoints

### Контейнеры

- `GET /containers` - Получить список всех контейнеров
- `GET /containers/:id` - Получить контейнер по ID
- `POST /containers` - Создать новый контейнер
- `PATCH /containers/:id` - Обновить статус контейнера
- `DELETE /containers/:id` - Удалить контейнер

### Зоны

- `GET /zones` - Получить список всех зон
- `GET /zones/:id` - Получить зону по ID
- `POST /zones` - Создать новую зону
- `POST /zones/:id/assign` - Разместить контейнер в зону
- `DELETE /zones/:id` - Удалить зону

## 📡 WebSocket Events

Подключение к WebSocket для получения real-time обновлений:

```javascript
const socket = io('http://localhost:3000');

socket.on('container:updated', (data) => {
  console.log('Container updated:', data);
});

socket.on('zone:updated', (data) => {
  console.log('Zone updated:', data);
});
```

## 🧪 Примеры запросов

### Создание зоны
```bash
curl -X POST http://localhost:3000/zones \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Zone A",
    "capacity": 100,
    "type": "STANDARD"
  }'
```

### Создание контейнера
```bash
curl -X POST http://localhost:3000/containers \
  -H "Content-Type: application/json" \
  -d '{
    "number": "CONT-001",
    "type": "DRY",
    "status": "ARRIVED"
  }'
```

### Размещение контейнера в зону
```bash
curl -X POST http://localhost:3000/zones/1/assign \
  -H "Content-Type: application/json" \
  -d '{
    "containerId": 1
  }'
```

### Обновление статуса контейнера
```bash
curl -X PATCH http://localhost:3000/containers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPED"
  }'
```

## 🗂️ Структура проекта

```
src/
├── containers/
│   ├── dto/
│   ├── entities/
│   ├── containers.controller.ts
│   ├── containers.service.ts
│   ├── containers.repository.ts
│   └── containers.module.ts
├── zones/
│   ├── dto/
│   ├── entities/
│   ├── zones.controller.ts
│   ├── zones.service.ts
│   ├── zones.repository.ts
│   └── zones.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── websocket/
│   ├── websocket.gateway.ts
│   └── websocket.module.ts
├── app.module.ts
└── main.ts
```

## 🔍 Бизнес-логика

1. **Добавление контейнера в зону**:
   - Проверяется доступная вместимость зоны
   - При успехе увеличивается `current_load`
   - Отправляется WebSocket событие

2. **Отгрузка контейнера** (статус → SHIPPED):
   - Уменьшается `current_load` зоны
   - Контейнер удаляется из зоны
   - Отправляется WebSocket событие

3. **Переполнение зоны**:
   - Возвращается ошибка 400 "Zone Overloaded"

## 🧪 Тестирование

Запуск тестов:
```bash
npm run test
npm run test:e2e
npm run test:cov
```

## 📦 Postman Collection

Импортируйте файл `postman_collection.json` в Postman для готовых примеров запросов.

## 🐳 Docker команды

```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Просмотр логов
docker-compose logs -f app

# Перезапуск
docker-compose restart

# Пересборка
docker-compose up -d --build
```

## 📝 Переменные окружения

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/container_db"

# Application
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🤝 Разработка

1. Создайте ветку для фичи
2. Внесите изменения
3. Запустите тесты
4. Создайте Pull Request

## 📄 Лицензия

MIT
