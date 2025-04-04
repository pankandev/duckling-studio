import React from 'react';
import {ChatResource} from "@/lib/resources/chat-resource";
import './chat-list-item.module.scss';

export default function ChatListItem({chat}: { chat: ChatResource }) {
    return <a className="chat-list-item" href={'/chats/' + chat.id}>{chat.displayName}</a>;
}