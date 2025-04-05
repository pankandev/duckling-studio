'use client';

import React, {useState} from 'react';
import {createEmptyChat} from "@/lib/api-services/chats";
import {useRouter} from "next/navigation";
import {ChatMessageInput} from "@/lib/types/chats";
import ChatPanel from "@/components/chat-panel";

export default function ChatsPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function startChatFromMessage(initialMessage: ChatMessageInput) {
        setLoading(true);
        const chatResult = await createEmptyChat(initialMessage.content);
        setLoading(false);
        if (chatResult.success) {
            router.replace(`/chats/${chatResult.value}`);
        }
    }

    return (
        <ChatPanel messages={[]} onSend={startChatFromMessage} disabled={loading}></ChatPanel>
    );
}