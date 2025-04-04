import {z} from "zod";
import {ChatMessage, ChatMessageRole} from "@prisma/client";


export const ChatMessageRoleSchema: z.Schema<ChatMessageRole> = z.enum(['ASSISTANT', 'USER']);

export interface ChatMessageResource {
    id: number;
    chatId: number;
    content: string;
    role: ChatMessageRole;
}

export const ChatMessageSchema: z.Schema<ChatMessageResource> = z.object({
    id: z.number(),
    chatId: z.number(),
    content: z.string(),
    role: ChatMessageRoleSchema,
});

export function chatMessageFromDb(data: ChatMessage): ChatMessageResource {
    return {
        id: data.id,
        chatId: data.chatId,
        content: data.content,
        role: data.role,
    }
}
