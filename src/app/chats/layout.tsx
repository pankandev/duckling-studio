'use client';

import Link from "next/link";
import React from "react";
import ChatList from "@/components/chat/chat-list";
import {useChats} from "@/lib/client/api/chats";


export default function ChatsLayout({children}: { children: React.ReactNode }) {
    const {data} = useChats();

    return (
        <>
            <div className="chats-layout flex flex-row items-stretch h-full">
                {/* Sidebar */}
                <div className="chats-sidebar flex flex-col px-4 py-2 w-80">
                    <Link className="pb-2" href={('/')}>
                        Home
                    </Link>
                    <Link className="pb-2" href={('/chats/new')}>
                        New Chat
                    </Link>
                    <div className="max-h-full overflow-y-auto pr-4 py-2">
                        {
                            data && (
                                data.success ?
                                    (<ChatList chats={data.value}></ChatList>) :
                                    (<div>{data.error.message}</div>)
                            )
                        }
                    </div>
                    <div className="h-24">

                    </div>
                </div>
                {/* Router Outlet */}
                <div className="chats-outlet flex grow flex-col items-stretch h-full p-0.5">
                    {children}
                </div>
            </div>
        </>
    )
}