import React, {ReactNode} from 'react';
import {ChatResource} from "@/lib/resources/chat-resource";
import ChatListItem from "@/components/chat-list-item";

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
        <div className="flex flex-col items-stretch justify-center w-full max-w-[18em] gap-2">
            {list}
        </div>
    );
}