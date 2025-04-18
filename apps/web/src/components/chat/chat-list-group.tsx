import React from 'react';
import {ChatResource} from "@/lib/common/resources/chat-resource";
import ChatListItem from "@/components/chat/chat-list-item";

export interface ChatGroup {
    name: string;
    chats: ChatResource[];
}

const ChatListGroup = ({group}: { group: ChatGroup }) => {
    return (
        <div className="flex flex-col items-stretch w-full gap-3">
            <span className="text-xs font-bold">{group.name}</span>
            <div className="flex flex-col items-stretch gap-1">
                {group.chats.map((chat) => (<ChatListItem chat={chat} key={chat.id}/>))}
            </div>
        </div>
    );
};

export default ChatListGroup;