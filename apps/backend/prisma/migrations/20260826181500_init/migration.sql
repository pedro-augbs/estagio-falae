-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FeedbackNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "feedbackId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedbackNote_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "Feedback_channel_idx" ON "Feedback"("channel");

-- CreateIndex
CREATE INDEX "Feedback_status_idx" ON "Feedback"("status");

-- CreateIndex
CREATE INDEX "Feedback_rating_idx" ON "Feedback"("rating");

-- CreateIndex
CREATE INDEX "FeedbackNote_createdAt_idx" ON "FeedbackNote"("createdAt");
