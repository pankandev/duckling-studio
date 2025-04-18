'use client';

import Link from "next/link";
import React from "react";
import ChatList from "@/components/chat/chat-list";
import {useChats} from "@/lib/client/api/chats";
import {Home, Pencil} from "lucide-react";
import {Button} from "@/components/ui/button";


export default function ChatsLayout({children}: { children: React.ReactNode }) {
    const {data} = useChats();

    return (
        <>
            <div className="chats-layout flex flex-row items-stretch h-full">
                {/* Sidebar */}
                <div className="chats-sidebar flex flex-col px-4 py-2 gap-2 w-80">
                    <Button asChild variant="ghost" className="text-sm flex flex-row justify-between items-center">
                        <Link href={('/')}>
                        <span>
                            Home
                        </span>
                        <Home size={16}></Home>
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" className="text-sm flex flex-row justify-between items-center">
                        <Link href={('/chats/new')}>
                            New Chat
                            <Pencil size={16}></Pencil>
                        </Link>
                    </Button>
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