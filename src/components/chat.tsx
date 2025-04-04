'use client'

import MessageList from "@/components/message-list";
import MessageInput from "@/components/message-input";
import {useState} from "react";
import {ChatMessageInput} from "@/lib/types/chats";
import {readTextStream} from "@/lib/api-services/stream";
import {useChatMessages} from "@/lib/api-services/chat-messages";


function sendMessageAtChat(chatId: number, message: ChatMessageInput): Promise<Response> {
    return fetch(`/api/v1/chats/${chatId}/messages/`, {
        method: "POST",
        body: JSON.stringify(message),
    });
}

export default function Chat({chatId}: {
    chatId: number
}) {
    const {
        data: messagesResult,
        error: messagesFetchError,
        isLoading: isLoadingMessages,
        mutate: mutateMessages
    } = useChatMessages(chatId);

    const [isSendingMessage, setIsSendingMessage] = useState<boolean>(isLoadingMessages);

    const [streamingMessage, setStreamingMessage] = useState<string | null>(null);

    async function sendMessage(message: ChatMessageInput) {
        setIsSendingMessage(true);
        const result = await sendMessageAtChat(chatId, message);
        await mutateMessages();
        if (result.ok) {
            let message = '';
            setStreamingMessage('');
            for await (const textPart of readTextStream(result)) {
                message += textPart;
                setStreamingMessage(message);
            }
            setStreamingMessage(null);
        }
        await mutateMessages();
        setIsSendingMessage(false);
    }

    const isLoading = isSendingMessage && isLoadingMessages;

    return (
        <div className="flex flex-col">
            {messagesResult?.success &&
                <MessageList messages={messagesResult.value} streamingMessage={streamingMessage ?? undefined}></MessageList>}
            {messagesFetchError && <div>{messagesFetchError.toString()}</div>}
            {isLoadingMessages && <div>Loading...</div>}
            <MessageInput onSend={sendMessage} disabled={isLoading}></MessageInput>
        </div>
    )
}