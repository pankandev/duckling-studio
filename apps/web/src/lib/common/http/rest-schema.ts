import {z} from "zod";


export interface RestResponseSingleItem<T> {
    item: T;
}

export interface RestResponseListItem<T> {
    items: T[];
}

export function buildRestResponseSingleItemSchema<T>(itemSchema: z.Schema<T, z.ZodTypeDef, unknown>): z.Schema<RestResponseSingleItem<T>> {
    return z.object({
        item: itemSchema,
    }) as z.Schema<RestResponseSingleItem<T>>;
}

export function buildRestResponseListItemSchema<T>(itemSchema: z.Schema<T, z.ZodTypeDef, unknown>): z.Schema<RestResponseListItem<T>> {
    return z.object({
        items: z.array(itemSchema),
    }) as z.Schema<RestResponseListItem<T>>;
}
