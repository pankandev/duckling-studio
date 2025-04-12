import {streamText} from "ai";
import {safeParseInt} from "@/lib/common/parsers/primitives";
import {HttpError} from "@/lib/common/http/http-error";
import {prisma} from "@/lib/server/db/client";
import {ChatMessage} from "@prisma/client";
import {buildListItemResponse} from "@/lib/common/http/rest-response";
import {chatMessageFromDb} from "@/lib/common/resources/chat-message-resource";
import {ChatMessageAiCompatible, dbMessageListToAiSdk, loadModel} from "@/lib/server/ai/llm";
import {aiSdkToInsertMessageDbList} from "@/lib/server/ai/ai";
import {ChatMessageInputSchema} from "@/lib/client/types/chats";


export async function GET(_: Request, {params}: { params: Promise<{ chatId: string }> }): Promise<Response> {
    const chatIdParse = safeParseInt((await params).chatId);
    if (!chatIdParse.success) {
        return HttpError.badRequestZod(chatIdParse.error).asResponse();
    }
    const chatId = chatIdParse.data;
    const chat = await prisma.chat.findFirst({
        where: {id: chatId}
    });
    if (!chat) {
        return HttpError.notFound('chat', {id: chatId}).asResponse();
    }

    const messages: ChatMessage[] = await prisma.chatMessage.findMany({
        where: {
            chatId,
        },
        orderBy: {createdAt: 'asc'}
    });

    return buildListItemResponse(messages.map(m => chatMessageFromDb(m)));
}

export async function POST(request: Request, {params}: { params: Promise<{ chatId: string }> }): Promise<Response> {
    const chatIdParse = safeParseInt((await params).chatId);
    if (!chatIdParse.success) {
        return HttpError.notFound('chat', {id: chatIdParse.data}).asResponse();
    }
    const chatId = chatIdParse.data;

    const messageParse = ChatMessageInputSchema.safeParse(await request.json());
    if (!messageParse.success) {
        return HttpError.badRequestZod(messageParse.error).asResponse();
    }
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

    const newMessage: ChatMessageAiCompatible = {
        role: "USER",
        content: messageParse.data.content,
    };

    const messages: ChatMessageAiCompatible[] = [
        ...(
            await prisma.chatMessage.findMany({
                where: {chatId: chatId},
                orderBy: {createdAt: 'asc'}
            })
        ),
        newMessage,
    ];

    const messagesAi = dbMessageListToAiSdk(messages);
    const now = new Date();

    const result = streamText({
        model: model,
        system: chat.systemMessage ?? undefined,
        messages: messagesAi,
        onFinish: async (m) => {
            await prisma.chatMessage.createMany({
                data: [
                    {
                        role: 'USER',
                        content: messageParse.data.content,
                        extraData: {},
                        chatId: chatId,
                        createdAt: now
                    },
                    ...aiSdkToInsertMessageDbList(m.response.messages, chatId)
                ]
            });
        }
    });

    result.consumeStream().then();
    return result.toTextStreamResponse();
}
