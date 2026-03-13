-- CreateIndex on externalUrl (UNIQUE)
CREATE UNIQUE INDEX "news_externalUrl_key" ON "news"("externalUrl");

-- CreateIndex on publishedAt
CREATE INDEX "news_publishedAt_idx" ON "news"("publishedAt");

-- CreateIndex on source
CREATE INDEX "news_source_idx" ON "news"("source");

-- CreateIndex on categoryId
CREATE INDEX "news_categoryId_idx" ON "news"("categoryId");

-- CreateIndex on source and publishedAt (composite)
CREATE INDEX "news_source_publishedAt_idx" ON "news"("source", "publishedAt");
