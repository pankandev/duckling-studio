import React, {Fragment} from "react";
import MessageListItem from "@/components/message";
import './message-list.module.scss';
import {ChatMessageResource} from "@/lib/resources/chat-message-resource";


export default function MessageList(props: {
    messages: ChatMessageResource[],
    streamingMessage?: string
}): React.ReactNode {
    const streamingMessage: ChatMessageResource | null = props.streamingMessage ? {
        id: -1,
        chatId: -1,
        content: props.streamingMessage,
        role: 'USER'
    } : null;
    return (
        <div className="message-list">
            {
                props.messages.map((message) => (
                    <Fragment key={message.id}>
                        <MessageListItem message={message}></MessageListItem>
                    </Fragment>
                ))
            }
            {streamingMessage && <MessageListItem message={streamingMessage}></MessageListItem>}
        </div>
    )
}