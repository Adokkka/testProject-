-- CreateEnum
CREATE TYPE "ContainerType" AS ENUM ('DRY', 'REFRIGERATED', 'OPEN_TOP', 'FLAT_RACK', 'TANK');

-- CreateEnum
CREATE TYPE "ContainerStatus" AS ENUM ('ARRIVED', 'IN_STORAGE', 'SHIPPED', 'DAMAGED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "ZoneType" AS ENUM ('STANDARD', 'REFRIGERATED', 'HAZARDOUS', 'CUSTOMS');

-- CreateTable
CREATE TABLE "containers" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "type" "ContainerType" NOT NULL,
    "status" "ContainerStatus" NOT NULL DEFAULT 'ARRIVED',
    "zone_id" INTEGER,
    "arrival_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "containers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "current_load" INTEGER NOT NULL DEFAULT 0,
    "type" "ZoneType" NOT NULL DEFAULT 'STANDARD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "containers_number_key" ON "containers"("number");

-- CreateIndex
CREATE UNIQUE INDEX "zones_name_key" ON "zones"("name");

-- AddForeignKey
ALTER TABLE "containers" ADD CONSTRAINT "containers_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
