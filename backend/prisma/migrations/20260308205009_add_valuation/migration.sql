-- CreateTable
CREATE TABLE "valuations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "localidad" TEXT NOT NULL,
    "metrosCubiertos" INTEGER NOT NULL,
    "metrosDescubiertos" INTEGER NOT NULL,
    "ambientes" INTEGER NOT NULL,
    "banos" INTEGER NOT NULL,
    "amenities" TEXT NOT NULL DEFAULT '',
    "otrosDatos" TEXT,
    "valorMinimo" DOUBLE PRECISION NOT NULL,
    "valorMaximo" DOUBLE PRECISION NOT NULL,
    "analisisIA" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "valuations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "valuations" ADD CONSTRAINT "valuations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
