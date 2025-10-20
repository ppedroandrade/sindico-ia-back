/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `CommonArea` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CommonArea_name_key" ON "CommonArea"("name");
