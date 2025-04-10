import React, {ReactNode} from 'react';
import ChatListItem from "@/components/chat/chat-list-item";
import {ChatResource} from "@/lib/common/resources/chat-resource";

export default function ChatList({chats}: { chats: ChatResource[] }) {
    let list: ReactNode;
    if (chats.length === 0) {
        list = (
            <p>No chat found for this page.</p>
        );
    } else {
        list = (
            <>
                {
                    chats.map((chat) => (<ChatListItem chat={chat} key={chat.id} />))
                }
            </>
        );
    }
    return (
        <div className="flex flex-col items-stretch justify-center w-full max-w-full gap-2">
            {list}
        </div>
    );
}