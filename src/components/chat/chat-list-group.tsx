import React from 'react';
import {ChatResource} from "@/lib/common/resources/chat-resource";
import ChatListItem from "@/components/chat/chat-list-item";

export interface ChatGroup {
    name: string;
    chats: ChatResource[];
}

const ChatListGroup = ({group}: {group: ChatGroup}) => {
    return (
        <div className="flex flex-col items-stretch w-full gap-1">
            <span className="text-xs font-bold">{group.name}</span>
            {group.chats.map((chat) => (<ChatListItem chat={chat} key={chat.id}/>))}
        </div>
    );
};

export default ChatListGroup;