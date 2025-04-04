'use client'

import {apiPost} from "@/lib/api-services/client";
import {z} from "zod";
import {Result} from "@/lib/result";
import {ChatResource, ChatResourceSchema} from "@/lib/resources/chat-resource";
import useSWR, {SWRResponse} from "swr";
import {buildListItemFetcher} from "@/lib/swr/buildGetItemFetcher";


export function useChats(): SWRResponse<Result<ChatResource[]>> {
    return useSWR('/api/v1/chats', buildListItemFetcher(ChatResourceSchema));
}

export async function createEmptyChat(initialMessage: string): Promise<Result<number>> {
    const response = await apiPost({
        responseSchema: z.object({
            item: z.object({
                id: z.number()
            })
        }),
        url: '/api/v1/chats',
        body: {
            initialMessage,
        }
    });
    return response.map(r => r.item.id);
}

