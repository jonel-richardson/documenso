-- AlterTable
ALTER TABLE "OrganisationGlobalSettings" ADD COLUMN     "engagementTrackingEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Recipient" ADD COLUMN     "firstOpenedAt" TIMESTAMP(3),
ADD COLUMN     "lastOpenedAt" TIMESTAMP(3),
ADD COLUMN     "openCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TeamGlobalSettings" ADD COLUMN     "engagementTrackingEnabled" BOOLEAN;

-- CreateTable
CREATE TABLE "RecipientViewEvent" (
    "id" TEXT NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipientViewEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecipientViewEvent_recipientId_viewedAt_idx" ON "RecipientViewEvent"("recipientId", "viewedAt");

-- AddForeignKey
ALTER TABLE "RecipientViewEvent" ADD CONSTRAINT "RecipientViewEvent_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
