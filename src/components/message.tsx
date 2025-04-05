'use client'

import React from "react";
import {ChatMessageResource} from "@/lib/resources/chat-message-resource";
import MarkdownIt from 'markdown-it';

export default function MessageListItem({message}: { message: ChatMessageResource }): React.ReactNode {
    const markdownIt = new MarkdownIt();
    const classNames = ['text-sm bg-gray-800/60 rounded-xl py-3 px-3', 'message-' + message.role.toLowerCase()];
    return (
        <div className={classNames.join(' ')}>
            <div className="message-content-markdown"
                 dangerouslySetInnerHTML={{__html: markdownIt.render(message.content)}}>
            </div>
        </div>
    )
}