'use client'

import {z} from "zod";
import {buildRestResponseListItemSchema, buildRestResponseSingleItemSchema} from "@/lib/common/http/rest-schema";
import {Result} from "@/lib/common/result";
import {apiGet} from "@/lib/client/api/client";

export function buildGetItemFetcher<T>(itemSchema: z.Schema<T>): (url: string) => Promise<Result<T>> {
    return async url => {
        const response = await apiGet({
            url,
            responseSchema: buildRestResponseSingleItemSchema(itemSchema),
        });
        return response.map(r => r.item);
    };
}

export function buildListItemFetcher<T>(itemSchema: z.Schema<T, z.ZodTypeDef, unknown>): (url: string) => Promise<Result<T[]>> {
    return async url => {
        const response = await apiGet({
            url,
            responseSchema: buildRestResponseListItemSchema(itemSchema),
        });
        return response.map(r => r.items);
    };
}
