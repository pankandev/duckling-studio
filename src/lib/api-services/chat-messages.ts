import useSWR, {SWRResponse} from "swr";
import {Result} from "@/lib/result";
import {buildListItemFetcher} from "@/lib/swr/buildGetItemFetcher";
import {ChatMessageResource, ChatMessageSchema} from "@/lib/resources/chat-message-resource";

export function useChatMessages(chatId: number): SWRResponse<Result<ChatMessageResource[]>> {
    return useSWR(`/api/v1/chats/${chatId}/messages`, buildListItemFetcher(ChatMessageSchema));
}
