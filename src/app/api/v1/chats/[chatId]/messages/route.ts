import {streamText} from "ai";
import {safeParseInt} from "@/lib/common/parsers/primitives";
import {HttpError} from "@/lib/common/http/http-error";
import {prisma} from "@/lib/server/db/client";
import {ChatMessage} from "@prisma/client";
import {buildListItemResponse} from "@/lib/common/http/rest-response";
import {chatMessageFromDb} from "@/lib/common/resources/chat-message-resource";
import {ChatMessageAiCompatible, dbMessageListToAiSdk} from "@/lib/server/ai/llm";
import {aiSdkToInsertMessageDbList} from "@/lib/server/ai/ai";
import {ChatMessageInputSchema} from "@/lib/client/types/chats";
import {loadChatConfigModel, loadChatConfiguration} from "@/lib/server/ai/chat-load";


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

    const chatConfig = await loadChatConfiguration(chatId);
    if (!chatConfig.success) {
        return HttpError.fromResult(chatConfig).asResponse();
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

    const modelResult = await loadChatConfigModel(messageParse.data.configId)
    if (!modelResult.success) {
        return HttpError.fromResult(modelResult).asResponse();
    }

    const result = streamText({
        model: modelResult.value,
        system: chatConfig.value.systemMessage ?? undefined,
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
