'use client';

import React, {useState} from 'react';
import {useRouter} from "next/navigation";
import ChatPanel from "@/components/chat-panel";
import { ChatMessageInput } from '@/lib/common/types/chats';
import {createEmptyChat} from "@/lib/client/api/chats";

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