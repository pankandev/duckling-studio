-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "currentConfigId" INTEGER,
ADD COLUMN     "systemMessage" TEXT;

-- CreateTable
CREATE TABLE "LLMProvider" (
    "id" SERIAL NOT NULL,
    "handle" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "LLMProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LLMConfig" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LLMConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LLMProvider_handle_key" ON "LLMProvider"("handle");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_currentConfigId_fkey" FOREIGN KEY ("currentConfigId") REFERENCES "LLMConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LLMConfig" ADD CONSTRAINT "LLMConfig_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "LLMProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
