import {DateTime} from "luxon";
import {z} from "zod";
import {ToDateTime} from "@/lib/common/parsers/to-date-time";
import {LLMConfigResource, LLMConfigSchema} from "@/lib/common/resources/llm-config";

export interface ChatResource {
    id: number;
    displayName: string;
    createdAt: DateTime;
    currentConfig: LLMConfigResource | null;
}

export const ChatResourceSchema: z.Schema<ChatResource, z.ZodTypeDef, unknown> = z.object({
    id: z.number(),
    displayName: z.string(),
    createdAt: ToDateTime,
    currentConfig: LLMConfigSchema.nullable().default(null),
});
