DROP INDEX "FeedbackNote_createdAt_idx";

CREATE INDEX "FeedbackNote_feedbackId_createdAt_idx" ON "FeedbackNote"("feedbackId", "createdAt");
