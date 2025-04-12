import {safeParseInt} from "@/lib/common/parsers/primitives";
import {HttpError} from "@/lib/common/http/http-error";
import {prisma} from "@/lib/server/db/client";
import {ChatMessageAiCompatible, dbMessageListToAiSdk, loadModel} from "@/lib/server/ai/llm";
import {streamText} from "ai";
import {aiSdkToInsertMessageDbList} from "@/lib/server/ai/ai";

export async function POST(_: Request, {params}: { params: Promise<{ chatId: string }> }): Promise<Response> {
    const chatIdParse = safeParseInt((await params).chatId);
    if (!chatIdParse.success) {
        return HttpError.notFound('chat', {id: chatIdParse.data}).asResponse();
    }
    const chatId = chatIdParse.data;

    const chat = await prisma.chat.findFirst({
        where: {id: chatId},
        include: {
            currentConfig: {
                include: {
                    provider: {
                        select: {
                            handle: true,
                        }
                    }
                }
            }
        }
    });
    if (chat === null) {
        return HttpError.notFound(
            'chat',
            {id: chatId},
        ).asResponse();
    }

    if (!chat.currentConfig) {
        return HttpError.conflict(
            'no-llm-configuration-set',
            'Chat has no LLM configuration set'
        ).asResponse();
    }

    const model = await loadModel(chat.currentConfig.provider.handle, chat.currentConfig.model);
    if (!model) {
        return HttpError.conflict(
            'invalid-llm-configuration',
            `Model "${chat.currentConfig.model}" for provider "${chat.currentConfig.provider.handle}" could not be loaded.`
        ).asResponse();
    }

    const messages: ChatMessageAiCompatible[] = await prisma.chatMessage.findMany({
        where: {chatId: chatId},
        orderBy: {createdAt: 'asc'}
    });

    const messagesAi = dbMessageListToAiSdk(messages);

    const result = streamText({
        model: model,
        system: chat.systemMessage ?? undefined,
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
