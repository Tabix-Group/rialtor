-- CreateTable
CREATE TABLE "projection_metrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prospectadosReferidos" INTEGER NOT NULL DEFAULT 0,
    "prospectadosFrios" INTEGER NOT NULL DEFAULT 0,
    "ticketPromedio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "comisionPorcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "agentLevel" TEXT NOT NULL DEFAULT 'inicial',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projection_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projection_metrics_userId_key" ON "projection_metrics"("userId");

-- AddForeignKey
ALTER TABLE "projection_metrics" ADD CONSTRAINT "projection_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
