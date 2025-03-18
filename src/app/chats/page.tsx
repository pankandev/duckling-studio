'use client';

import React, {useState} from 'react';
import MessageInput from "@/app/chats/components/message-input";
import {ChatMessageInput, startChat} from "@/services/chats";
import {useRouter} from "next/navigation";

export default function ChatsPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function startChatFromMessage(initialMessage: ChatMessageInput) {
        setLoading(true);
        const {id: chatId} = await startChat(initialMessage);
        setLoading(false);
        router.push(`/chats/${chatId}`);
    }

    return (
        <div>
            <MessageInput onSend={startChatFromMessage} disabled={loading}>
                New chat
            </MessageInput>
        </div>
    );
}