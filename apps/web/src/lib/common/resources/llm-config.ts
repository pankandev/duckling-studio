import {DateTime} from "luxon";
import {z} from "zod";
import {ToDateTime} from "@/lib/common/parsers/to-date-time";
import {LLMModelResource, LLMModelSchema} from "@/lib/common/resources/llm-model";


export interface LLMProviderResource {
    handle: string;
    name: string;
}

export interface LLMProviderWithModelsResource extends LLMProviderResource {
    models: LLMModelResource[] | null;
}

export interface LLMConfigResource {
    id: number;
    createdAt: DateTime;
    lastUsed: DateTime;
    model: string;
    provider: LLMProviderResource;
}

export interface LLMConfigCreate {
    model: string;
    providerHandle: string;
}

export const LLMConfigCreate = z.object({
    model: z.string(),
    providerHandle: z.string(),
});

export const LLMProviderSchema: z.ZodSchema<LLMProviderResource, z.ZodTypeDef, unknown> = z.object({
    handle: z.string(),
    name: z.string(),
});

export const LLMProviderWithModelsSchema: z.ZodSchema<LLMProviderWithModelsResource, z.ZodTypeDef, unknown> = z.object({
    handle: z.string(),
    name: z.string(),
    models: LLMModelSchema.array().nullable(),
});

export const LLMConfigSchema: z.ZodSchema<LLMConfigResource, z.ZodTypeDef, unknown> = z.object({
    id: z.number().int(),
    createdAt: ToDateTime,
    lastUsed: ToDateTime,
    model: z.string(),
    provider: LLMProviderSchema,
})