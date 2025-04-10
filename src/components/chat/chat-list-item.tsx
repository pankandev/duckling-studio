import React from 'react';
import Link from "next/link";
import {ChatResource} from "@/lib/common/resources/chat-resource";

export default function ChatListItem({chat}: { chat: ChatResource }) {
    return <Link
        className="btn bg-gray-600/10 hover:bg-gray-600/50 rounded px-2 py-1"
        href={'/chats/' + chat.id}
        shallow={true}
    >
        {chat.displayName}
    </Link>;
}