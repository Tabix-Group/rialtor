-- CreateTable
CREATE TABLE "economic_indices" (
    "id" TEXT NOT NULL,
    "indicator" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "variation" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "economic_indices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "economic_indices_indicator_date_key" ON "economic_indices"("indicator", "date");
