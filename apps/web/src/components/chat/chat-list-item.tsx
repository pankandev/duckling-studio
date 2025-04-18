'use client';

import React, {useCallback} from 'react';
import Link from "next/link";
import {ChatResource} from "@/lib/common/resources/chat-resource";
import {clsx} from "clsx";
import {usePathname, useRouter} from "next/navigation";
import {Trash} from "lucide-react";
import {useChats} from "@/lib/client/api/chats";
import {apiDelete} from "@/lib/client/api/client";

export default function ChatListItem({chat}: { chat: ChatResource }) {
    const {mutate: mutateChats} = useChats();
    const pathname = usePathname();
    const href = '/chats/' + chat.id;
    const router = useRouter();
    const isActive = pathname === href;

    const deleteChat = useCallback(async ()=> {
        const response = await apiDelete({url: '/api/v1/chats/' + chat.id, body: {}});
        if (!response.success) {
            return;
        }

        if (isActive) {
            router.replace('/chats');
        }

        await mutateChats();
    }, [chat.id, mutateChats, isActive, router]);

    return <Link
        className={
            clsx(
                'flex flex-row justify-between items-center btn px-4 py-2 gap-2',
                {
                    'bg-accent/95': isActive,
                }
            )}
        href={href}
        shallow={true}
    >
        <span className="grow overflow-hidden text-nowrap whitespace-nowrap text-ellipsis text-sm">{chat.displayName}</span>
        <div role="button" className="btn" onClick={deleteChat}>
            <Trash size={15}></Trash>
        </div>
    </Link>;
}