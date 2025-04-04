import {SafeParseReturnType, z} from "zod";

export function safeParseInt(text: string): SafeParseReturnType<number, number> {
    return z.coerce.number().int().safeParse(text);
}
