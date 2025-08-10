-- CreateTable
CREATE TABLE "property_plaques" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "propertyData" TEXT NOT NULL,
    "originalImages" TEXT NOT NULL,
    "generatedImages" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "aiPrompt" TEXT,
    "aiResponse" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "property_plaques_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "property_plaques" ADD CONSTRAINT "property_plaques_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
