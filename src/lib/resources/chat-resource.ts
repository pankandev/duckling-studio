import {z} from "zod";

export interface ChatResource {
    id: number;
    displayName: string;
}

export const ChatResourceSchema: z.Schema<ChatResource> = z.object({
    id: z.number(),
    displayName: z.string(),
});
