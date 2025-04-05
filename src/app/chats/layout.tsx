'use client';

import Link from "next/link";
import React from "react";
import {useChats} from "@/lib/api-services/chats";
import ChatList from "@/components/chat-list";


export default function ChatsLayout({children}: { children: React.ReactNode }) {
    const {data} = useChats();

    return (
        <>
            <div className="chats-layout flex flex-row items-stretch h-full">
                {/* Sidebar */}
                <div className="chats-sidebar flex flex-col px-4 py-2">
                    <Link className="pb-2" href={('/')}>
                        Home
                    </Link>
                    {
                        data && (
                            data.success ?
                                (<ChatList chats={data.value}></ChatList>) :
                                (<div>{data.error.message}</div>)
                        )
                    }
                </div>
                {/* Router Outlet */}
                <div className="chats-outlet flex grow flex-col items-stretch h-full p-0.5">
                    {children}
                </div>
            </div>
        </>
    )
}