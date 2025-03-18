import {ChatMessage} from "@prisma/client";
import React, {Fragment} from "react";
import MessageListItem from "@/app/chats/components/message";


export default function MessageList(props: { messages: ChatMessage[] }): React.ReactNode {
    return (
        <div className="flex flex-col items-stretch">
            {
                props.messages.map((message) => (
                    <Fragment key={message.id}>
                        <MessageListItem message={message}></MessageListItem>
                    </Fragment>
                ))
            }
        </div>
    )
}