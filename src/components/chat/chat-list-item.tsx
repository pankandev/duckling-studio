import React from 'react';
import Link from "next/link";
import {ChatResource} from "@/lib/common/resources/chat-resource";

export default function ChatListItem({chat}: { chat: ChatResource }) {
    return <Link
        className="btn hover:bg-gray-600/20 active:bg-gray-600/50 rounded px-2 py-1 text-nowrap whitespace-nowrap overflow-hidden text-ellipsis text-sm"
        href={'/chats/' + chat.id}
        shallow={true}
    >
        {chat.displayName}
    </Link>;
}