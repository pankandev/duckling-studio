import Link from "next/link";
import React from "react";
import {listChats} from "@/services/chats";


export default async function ChatsLayout({children}: {children: React.ReactNode}) {
    const chats = await listChats();
    return (
        <div>
            <Link href={('/')}>
                Volver
            </Link>
            <div className="flex flex-row items-start">
                <div className="flex flex-col items-center justify-center">
                    {
                        chats.length > 0 ? (
                            chats.map((chat) => (
                                <div key={chat.id}>{chat.displayName}</div>
                            ))
                        ) : (
                            <p>
                                No chat found for this page.
                            </p>
                        )
                    }
                </div>
                <div className="flex flex-col items-center justify-center">
                    {children}
                </div>
            </div>
        </div>
    )
}