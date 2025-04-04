'use client'

import React from "react";
import './message.module.scss';
import {ChatMessageResource} from "@/lib/resources/chat-message-resource";
import MarkdownIt from 'markdown-it';

export default function MessageListItem({message}: {message: ChatMessageResource }): React.ReactNode {
    const markdownIt = new MarkdownIt();
    return (
        <div className="message-list-item" dangerouslySetInnerHTML={{__html: markdownIt.render(message.content)}}>
        </div>
    )
}