-- AddColumn - Rental valuation fields
ALTER TABLE "valuations" ADD COLUMN "valorAlquilerUSD" DOUBLE PRECISION;
ALTER TABLE "valuations" ADD COLUMN "valorAlquilerARS" DOUBLE PRECISION;
ALTER TABLE "valuations" ADD COLUMN "porcentajeAlquiler" DOUBLE PRECISION;
