/*
  Warnings:

  - You are about to drop the column `badgeId` on the `TrustBadge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."TrustBadge" DROP COLUMN "badgeId",
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
