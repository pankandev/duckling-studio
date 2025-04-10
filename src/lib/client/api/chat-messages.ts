import { Result } from "@/lib/common/result";
import useSWR, {SWRResponse} from "swr";
import {buildListItemFetcher} from "@/lib/client/swr/buildGetItemFetcher";
import {ChatMessageResource, ChatMessageSchema} from "@/lib/common/resources/chat-message-resource";

export function useChatMessages(chatId: number | null): SWRResponse<Result<ChatMessageResource[]>> {
    const url = chatId !== null ? `/api/v1/chats/${chatId}/messages` : null;
    return useSWR(url, buildListItemFetcher(ChatMessageSchema));
}
