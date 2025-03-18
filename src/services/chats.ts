'use server'

import {Chat, ChatMessage} from "@prisma/client";
import {prisma} from "@/services/db";
import {continueChat, DefaultLLM} from "@/services/llm";
import {CoreMessage, generateText} from "ai";
import {err, ok, Result} from "./result";
import {AppError} from "@/services/error";

export async function loadChatMessages(chatId: number): Promise<ChatMessage[]> {
    return prisma.chatMessage.findMany({
        where: {
            chatId: chatId
        }
    });
}


type GetIfArray<T> = T extends Array<infer V> ? V : null;

type ChatMessageCreateManyInput = NonNullable<GetIfArray<NonNullable<Parameters<typeof prisma.chatMessage.createMany>[0]>['data']>>;

function aiSdkToInsertMessageDb(message: CoreMessage, chatId: number): ChatMessageCreateManyInput {
    return {
        chatId: chatId,
        role: message.role === 'user' ? 'USER' : 'ASSISTANT',
        content: message.content.toString(),
        extraData: {},
    };
}

function aiSdkToInsertMessageDbList(messages: CoreMessage[], chatId: number): ChatMessageCreateManyInput[] {
    return messages.map(m => aiSdkToInsertMessageDb(m, chatId));
}

export interface ChatMessageInput {
    content: string;
}

export async function generateChatNameFromMessage(message: ChatMessageInput): Promise<string> {
    const systemMessage = "" +
        "You will receive a message from a chat" +
        "Your role is to describe in a single sentence the topic" +
        "this chat will about." +
        "" +
        "Examples:" +
        "'why is keras not as used as pytorch or tensorflow?' -> 'Keras vs PyTorch Tensorflow' " +
        "'I dont know what I am really looking in a job, i have a lot of criteria but no job check all the boxes' -> 'Job criteria priorization";
    const response = await generateText({
        model: DefaultLLM,
        system: systemMessage,
        prompt: message.content
    });
    return response.text;
}

export async function startChat(initialMessage: ChatMessageInput): Promise<Chat> {
    const chat = await prisma.chat.create({
        data: {
            displayName: await generateChatNameFromMessage(initialMessage),
        }
    });

    const userMessage: ChatMessageCreateManyInput = {
        role: 'USER',
        content: initialMessage.content,
        chatId: chat.id,
        extraData: {}
    };
    const response = await continueChat([
        userMessage
    ]);

    await prisma.chatMessage.createMany({
        data: [
            userMessage,
            ...aiSdkToInsertMessageDbList(response, chat.id)
        ],
    });

    return chat;
}

export async function sendMessageAtChat(message: ChatMessageInput, chatId: number): Promise<Result<void>> {
    const result = await prisma.chat.findFirst({
        where: {id: chatId},
        select: {id: true}
    });
    if (result == null) {
        return err(
            AppError.notFound(
                'chat',
                {id: chatId},
            )
        )
    }

    const userMessage: ChatMessageCreateManyInput = {
        role: 'USER',
        content: message.content,
        chatId: chatId,
        extraData: {}
    };
    const messages = await prisma.chatMessage.findMany({
        where: {chatId: chatId},
        orderBy: {createdAt: 'asc'}
    });

    const response = await continueChat([
        ...messages,
        userMessage,
    ]);

    await prisma.chatMessage.createMany({
        data: [userMessage, ...aiSdkToInsertMessageDbList(response, chatId)]
    });

    return ok();
}

export async function listChats(): Promise<Chat[]> {
    return prisma.chat.findMany();
}
