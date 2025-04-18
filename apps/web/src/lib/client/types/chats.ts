import {z} from "zod";

export interface ChatMessageInput {
    content: string;
    configId: number;
}

export const ChatMessageInputSchema: z.ZodSchema<ChatMessageInput> = z.object({
    content: z.string().min(1),
    configId: z.number(),
});

export interface ChatMessageUpdateBody {
    content: string;
}

export const ChatMessageUpdateBodySchema: z.ZodSchema<ChatMessageUpdateBody> = z.object({
    content: z.string().min(1),
});
