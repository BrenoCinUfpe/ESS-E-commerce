/*
  Warnings:

  - You are about to drop the `TB_ITENS` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `TB_PRODUCT` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TB_ITENS" DROP CONSTRAINT "TB_ITENS_categoryId_fkey";

-- AlterTable
ALTER TABLE "TB_PRODUCT" ADD COLUMN     "description" TEXT NOT NULL;

-- DropTable
DROP TABLE "TB_ITENS";