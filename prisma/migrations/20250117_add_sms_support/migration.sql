-- AlterTable: Add messageType and messageBody columns to Email table
ALTER TABLE "Email" ADD COLUMN "messageType" TEXT NOT NULL DEFAULT 'email';
ALTER TABLE "Email" ADD COLUMN "messageBody" TEXT;

-- Update existing records to have messageType = 'email' (already done by DEFAULT)
-- screenshotUrl is already nullable, no change needed
