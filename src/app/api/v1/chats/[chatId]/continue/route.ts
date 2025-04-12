import {safeParseInt} from "@/lib/common/parsers/primitives";
import {HttpError} from "@/lib/common/http/http-error";
import {prisma} from "@/lib/server/db/client";
import {ChatMessageAiCompatible, dbMessageListToAiSdk} from "@/lib/server/ai/llm";
import {streamText} from "ai";
import {aiSdkToInsertMessageDbList} from "@/lib/server/ai/ai";
import {loadChatModel} from "@/lib/server/ai/chat-load";


export async function POST(_: Request, {params}: { params: Promise<{ chatId: string }> }): Promise<Response> {
    const chatIdParse = safeParseInt((await params).chatId);
    if (!chatIdParse.success) {
        return HttpError.notFound('chat', {id: chatIdParse.data}).asResponse();
    }
    const chatId = chatIdParse.data;

    const chatConfig = await loadChatModel(chatId);
    if (!chatConfig.success) {
        return HttpError.fromResult(chatConfig).asResponse();
    }

    const messages: ChatMessageAiCompatible[] = await prisma.chatMessage.findMany({
        where: {chatId: chatId},
        orderBy: {createdAt: 'asc'}
    });

    const messagesAi = dbMessageListToAiSdk(messages);

    const result = streamText({
        model: chatConfig.value.model,
        system: chatConfig.value.systemMessage ?? undefined,
        messages: messagesAi,
        onFinish: async (m) => {
            await prisma.chatMessage.createMany({
                data: aiSdkToInsertMessageDbList(m.response.messages, chatId)
            });
        }
    });

    result.consumeStream().then();
    return result.toTextStreamResponse();
}
