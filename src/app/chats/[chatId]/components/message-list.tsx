import { ChatMessage } from "@prisma/client";
import React from "react";
import MessageListItem from "@/app/chats/[chatId]/components/message";


export default function MessageList(messages: ChatMessage[]): React.ReactNode {
    return (
        <div className="flex flex-col items-stretch">
            {
                messages.map((message) => MessageListItem(message))
            }
        </div>
    )
}