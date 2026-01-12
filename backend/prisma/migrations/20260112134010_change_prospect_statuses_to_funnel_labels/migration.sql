/*
  Warnings:

  - The values [TENTATIVE,CONTACTED,QUALIFIED,WON,LOST] on the enum `ProspectStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProspectStatus_new" AS ENUM ('PROSPECTOS', 'TASACIONES', 'CAPTACIONES', 'RESERVAS', 'CIERRES');
ALTER TABLE "prospects" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "prospects" ALTER COLUMN "status" TYPE "ProspectStatus_new" USING ("status"::text::"ProspectStatus_new");
ALTER TYPE "ProspectStatus" RENAME TO "ProspectStatus_old";
ALTER TYPE "ProspectStatus_new" RENAME TO "ProspectStatus";
DROP TYPE "ProspectStatus_old";
ALTER TABLE "prospects" ALTER COLUMN "status" SET DEFAULT 'PROSPECTOS';
COMMIT;

-- AlterTable
ALTER TABLE "prospects" ALTER COLUMN "status" SET DEFAULT 'PROSPECTOS';
