'use client'

import React, {useCallback, useState} from 'react';
import {createEmptyChat} from "@/lib/client/api/chats";
import {ChatMessageInput} from "@/lib/client/types/chats";
import {useRouter} from "next/navigation";
import {useChatMessages} from "@/lib/client/api/chat-messages";
import {ChatMessageResource} from "@/lib/common/resources/chat-message-resource";
import {readTextStream} from "@/lib/client/api/stream";
import Chat from "@/components/chat/chat";

function sendMessageAtChat(chatId: number, message: ChatMessageInput): Promise<Response> {
    return fetch(`/api/v1/chats/${chatId}/messages/`, {
        method: "POST",
        body: JSON.stringify(message),
    });
}

const ChatFetch = ({chatId}: { chatId: number | null }) => {
    const router = useRouter();
    const [streamingMessages, setStreamingMessages] = useState<ChatMessageResource[] | null>(null);
    const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

    const {
        data: messagesResult,
        error: messagesFetchError,
        isLoading: isLoadingMessages,
        mutate: mutateMessages,
    } = useChatMessages(chatId);

    const sendMessage = useCallback(async (message: ChatMessageInput) => {
        // optimistically load new message
        setIsSendingMessage(true);
        const userMessage: ChatMessageResource = {
            id: -1,
            chatId: -1,
            content: message.content,
            role: "USER"
        };
        setStreamingMessages([userMessage]);

        let thisChatId: number;
        if (chatId === null) {
            // create chat if not defined
            const thisChatIdResult = await createEmptyChat(message.content);
            if (!thisChatIdResult.success) {
                setStreamingMessages(null);
                setIsSendingMessage(false);
                return;
            }
            thisChatId = thisChatIdResult.value;
        } else {
            thisChatId = chatId;
        }

        // send message
        const result = await sendMessageAtChat(thisChatId, message);
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
        if (chatId === null) {
            router.replace("/chats/" + thisChatId);
        } else {
            setIsSendingMessage(false);
        }
    }, [chatId, mutateMessages, router]);


    if (messagesResult && !messagesResult.success) {
        return (
            <>
                {messagesFetchError && <div>{messagesFetchError.toString()}</div>}
            </>
        );
    }

    const messages = [...(messagesResult?.value ?? [])];
    if (streamingMessages) {
        messages.push(...streamingMessages);
    }

    const isLoading = isSendingMessage || isLoadingMessages;
    return (
        <Chat
            messages={messages}
            onSend={sendMessage}
            disabled={isLoading}
            onMessageUpdate={() => mutateMessages()}
        ></Chat>
    );
};

export default ChatFetch;