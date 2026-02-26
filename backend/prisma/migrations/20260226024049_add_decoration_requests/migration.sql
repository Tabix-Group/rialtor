-- CreateTable
CREATE TABLE "decoration_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "generatedUrl" TEXT,
    "generatedId" TEXT,
    "style" TEXT NOT NULL DEFAULT 'moderno',
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "errorMessage" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decoration_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "decoration_requests" ADD CONSTRAINT "decoration_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
