import {ChatMessage} from "@prisma/client";
import React from "react";


export default function MessageListItem(message: ChatMessage): React.ReactNode {
    return (
        <div className="message-list-item">
            {message.content}
        </div>
    )
}