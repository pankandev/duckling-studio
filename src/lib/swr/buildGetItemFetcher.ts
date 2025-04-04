'use client'

import {z} from "zod";
import {apiGet} from "@/lib/api-services/client";
import {buildRestResponseListItemSchema, buildRestResponseSingleItemSchema} from "@/lib/http/rest-schema";
import {Result} from "../result";

export function buildGetItemFetcher<T>(itemSchema: z.Schema<T>): (url: string) => Promise<Result<T>> {
    return async url => {
        const response = await apiGet({
            url,
            responseSchema: buildRestResponseSingleItemSchema(itemSchema),
        });
        return response.map(r => r.item);
    };
}

export function buildListItemFetcher<T>(itemSchema: z.Schema<T>): (url: string) => Promise<Result<T[]>> {
    return async url => {
        const response = await apiGet({
            url,
            responseSchema: buildRestResponseListItemSchema(itemSchema),
        });
        return response.map(r => r.items);
    };
}
