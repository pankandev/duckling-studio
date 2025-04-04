'use client';

import React, {useState} from 'react';
import MessageInput from "@/components/message-input";
import {createEmptyChat} from "@/lib/api-services/chats";
import {useRouter} from "next/navigation";
import {ChatMessageInput} from "@/lib/types/chats";

export default function ChatsPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function startChatFromMessage(initialMessage: ChatMessageInput) {
        setLoading(true);
        const chatResult = await createEmptyChat(initialMessage.content);
        setLoading(false);
        if (chatResult.success) {
            router.push(`/chats/${chatResult.value}`);
        }
    }

    return (
        <div>
            <MessageInput onSend={startChatFromMessage} disabled={loading}>
            </MessageInput>
        </div>
    );
}