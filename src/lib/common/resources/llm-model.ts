import {z} from "zod";


export interface LLMModelResource {
    id: string;
    name: string;
}

export const LLMModelSchema: z.ZodSchema<LLMModelResource, z.ZodTypeDef, unknown> = z.object({
    id: z.string(),
    name: z.string(),
});
