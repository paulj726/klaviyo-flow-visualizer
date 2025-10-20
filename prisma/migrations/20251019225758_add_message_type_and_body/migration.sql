-- AlterTable
ALTER TABLE "Email" ADD COLUMN "messageType" TEXT NOT NULL DEFAULT 'email';
ALTER TABLE "Email" ADD COLUMN "messageBody" TEXT;
