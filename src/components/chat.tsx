'use client'

import React, {useState} from "react";
import ChatPanel from "@/components/chat-panel";
import {ChatMessageInput} from "@/lib/common/types/chats";
import {ChatMessageResource} from "@/lib/common/resources/chat-message-resource";
import {readTextStream} from "@/lib/client/api/stream";
import {useChatMessages} from "@/lib/client/api/chat-messages";


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
        mutate: mutateMessages,
    } = useChatMessages(chatId);

    const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

    const [streamingMessages, setStreamingMessages] = useState<ChatMessageResource[] | null>(null);

    async function sendMessage(message: ChatMessageInput) {
        setIsSendingMessage(true);
        const userMessage: ChatMessageResource = {
            id: -1,
            chatId: -1,
            content: message.content,
            role: "USER"
        };
        setStreamingMessages([userMessage]);
        const result = await sendMessageAtChat(chatId, message);
        await mutateMessages();
        if (result.ok) {
            let message = '';
            for await (const textPart of readTextStream(result)) {
                message += textPart;
                const streamingMessage: ChatMessageResource = {
                    id: -2,
                    chatId: -2,
                    content: message,
                    role: "ASSISTANT"
                };
                setStreamingMessages([userMessage, streamingMessage]);
            }
            setStreamingMessages(null);
        }
        await mutateMessages();
        setIsSendingMessage(false);
    }

    const isLoading = isSendingMessage || isLoadingMessages;

    if (!messagesResult?.success) {
        return (
            <>
                {messagesFetchError && <div>{messagesFetchError.toString()}</div>}
            </>
        );
    }

    const messages = [...messagesResult.value];
    if (streamingMessages) {
        messages.push(...streamingMessages);
    }

    return (
        <ChatPanel messages={messages} onSend={sendMessage} disabled={isLoading}></ChatPanel>
    )
}