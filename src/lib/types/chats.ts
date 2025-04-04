import {z} from "zod";

export interface ChatMessageInput {
    content: string;
}

export const ChatMessageInputSchema: z.ZodSchema<ChatMessageInput> = z.object({
    content: z.string(),
});
