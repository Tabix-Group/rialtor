-- CreateTable
CREATE TABLE "bank_rates" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bank_rates_bankName_key" ON "bank_rates"("bankName");
