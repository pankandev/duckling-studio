'use client'

import {z} from "zod";
import {Result} from "@/lib/common/result";
import useSWR, {SWRResponse} from "swr";
import {apiPost} from "@/lib/client/api/client";
import {ChatResource, ChatResourceSchema} from "@/lib/common/resources/chat-resource";
import {buildListItemFetcher} from "@/lib/client/swr/buildGetItemFetcher";


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

