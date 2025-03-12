-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "display_name" TEXT NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "is_user" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "extraData" JSONB NOT NULL,
    "chat_id" INTEGER NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
