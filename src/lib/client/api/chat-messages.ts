import { Result } from "@/lib/common/result";
import useSWR, {SWRResponse} from "swr";
import {buildListItemFetcher} from "@/lib/client/swr/buildGetItemFetcher";
import {ChatMessageResource, ChatMessageSchema} from "@/lib/common/resources/chat-message-resource";

export function useChatMessages(chatId: number): SWRResponse<Result<ChatMessageResource[]>> {
    return useSWR(`/api/v1/chats/${chatId}/messages`, buildListItemFetcher(ChatMessageSchema));
}
