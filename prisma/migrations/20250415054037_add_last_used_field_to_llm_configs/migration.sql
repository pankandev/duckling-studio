-- AlterTable
ALTER TABLE "LLMConfig" ADD COLUMN     "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
