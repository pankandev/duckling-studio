import {DateTime} from "luxon";
import {z} from "zod";

export interface ChatResource {
    id: number;
    displayName: string;
    createdAt: DateTime;
}

export const ChatResourceSchema: z.Schema<ChatResource, z.ZodTypeDef, unknown> = z.object({
    id: z.number(),
    displayName: z.string(),
    createdAt: z.string().transform(s => DateTime.fromISO(s)),
});
