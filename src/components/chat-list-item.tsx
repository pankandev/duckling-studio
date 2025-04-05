import React from 'react';
import {ChatResource} from "@/lib/resources/chat-resource";
import Link from "next/link";

export default function ChatListItem({chat}: { chat: ChatResource }) {
    return <Link
        className="btn bg-gray-600/10 hover:bg-gray-600/50 rounded px-2 py-1"
        href={'/chats/' + chat.id}
        shallow={true}
    >
        {chat.displayName}
    </Link>;
}