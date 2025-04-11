import React, {Fragment} from "react";
import MessageListItem from "@/components/messages/message";
import {ChatMessageResource} from "@/lib/common/resources/chat-message-resource";


export default function MessageList(props: {
    messages: ChatMessageResource[],
    onMessageUpdate?: () => unknown;
}): React.ReactNode {
    return (
        <div className="flex flex-col justify-start items-stretch gap-2">
            {
                props.messages.map((message) => (
                    <Fragment key={message.id}>
                        <MessageListItem message={message} onUpdate={props.onMessageUpdate}></MessageListItem>
                    </Fragment>
                ))
            }
        </div>
    )
}