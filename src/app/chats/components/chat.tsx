'use client'

import {ChatMessage} from "@prisma/client";
import MessageList from "@/app/chats/components/message-list";
import MessageInput from "@/app/chats/components/message-input";
import {ChatMessageInput, loadChatMessages, sendMessageAtChat} from "@/services/chats";
import {useEffect, useState} from "react";


export default function Chat({chatId}: {
    chatId: number
}) {
    const [loading, setLoading] = useState(false);
    const [refreshMessageId, refreshMessages] = useState<number>(0);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
        setLoading(true);
        loadChatMessages(chatId).then((m) => {
            setMessages(m);
            setLoading(false);
        });
    }, [refreshMessageId, chatId]);

    async function sendMessage(message: ChatMessageInput) {
        setLoading(true);
        const result = await sendMessageAtChat(message, chatId);
        setLoading(false);
        refreshMessages(refreshMessageId + 1);
    }

    return (
        <div className="flex flex-col">
            <MessageList messages={messages}></MessageList>
            <MessageInput onSend={sendMessage} disabled={loading}></MessageInput>
        </div>
    )
}