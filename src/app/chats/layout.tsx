'use client';

import Link from "next/link";
import React from "react";
import {useChats} from "@/lib/api-services/chats";
import ChatList from "@/components/chat-list";


export default function ChatsLayout({children}: { children: React.ReactNode }) {
    const {data} = useChats();

    return (
        <div>
            <Link href={('/')}>
                Volver
            </Link>
            <div className="flex flex-row items-start">
                {
                    data ? (
                        data.success ?
                            (<ChatList chats={data.value}></ChatList>) :
                            (<div>{data.error.message}</div>)
                    ) : null
                }
                <div className="flex flex-col items-center justify-center">
                    {children}
                </div>
            </div>
        </div>
    )
}