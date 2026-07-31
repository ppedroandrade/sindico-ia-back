-- CreateEnum
CREATE TYPE "CleaningStatus" AS ENUM ('pending', 'cleaned');

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "cleanedAt" TIMESTAMP(3),
ADD COLUMN     "cleanedById" TEXT,
ADD COLUMN     "cleaningNotes" TEXT,
ADD COLUMN     "cleaningStatus" "CleaningStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "itemsVerified" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_cleanedById_fkey" FOREIGN KEY ("cleanedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
