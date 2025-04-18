'use client'

import {safeParseInt} from "@/lib/common/parsers/primitives";
import ChatFetch from "@/components/chat/chat-fetch";
import {use} from "react";


export default function Page({params: paramsReact}: {params: Promise<{chatId: string}>}) {
    const params = use(paramsReact);
    let chatId: number | null = null;
    if (params.chatId !== 'new') {
        const chatIdString = params.chatId;
        const chatIdParse = safeParseInt(chatIdString);
        if (chatIdParse.success) {
            chatId = chatIdParse.data;
        }
    }

    return <ChatFetch chatId={chatId}></ChatFetch>
}