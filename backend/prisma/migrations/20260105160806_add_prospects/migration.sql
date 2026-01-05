-- CreateEnum
CREATE TYPE "ProspectStatus" AS ENUM ('TENTATIVE', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST');

-- CreateTable
CREATE TABLE "prospects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "estimatedValue" DOUBLE PRECISION,
    "estimatedCommission" DOUBLE PRECISION,
    "clientsProspected" INTEGER DEFAULT 0,
    "probability" INTEGER,
    "status" "ProspectStatus" NOT NULL DEFAULT 'TENTATIVE',
    "closedValue" DOUBLE PRECISION,
    "closeDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "prospects_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
