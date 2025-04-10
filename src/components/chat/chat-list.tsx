'use client'

import React, {ReactNode} from 'react';
import {ChatResource} from "@/lib/common/resources/chat-resource";
import ChatListGroup, {ChatGroup} from "@/components/chat/chat-list-group";
import {DateTime, Duration} from "luxon";


export class ChatGroupBuilder {
    private readonly chats: ChatResource[] = [];

    public constructor(
        public readonly name: string,
        private readonly startDate: DateTime | null,
    ) {
    }

    public addIfValid(chat: ChatResource): boolean {
        if (this.startDate === null || chat.createdAt < this.startDate) {
            return false;
        }
        this.chats.push(chat);
        return true;
    }

    public build(): ChatGroup {
        return {
            name: this.name,
            chats: [...this.chats],
        }
    }

    public get empty(): boolean {
        return this.chats.length === 0;
    }
}

/**
 * Groups chats by date groups:
 * - Today: Chats from today
 * - Last 7 days: Chats from yesterday to the 7 days before
 * - Last 30 days: Chats from 8 days before to 30 days before
 * - [Month]: Chats past from 31 days before grouped by months
 * @param chats Chats list, must be ordered by date ascending.
 *
 * @returns Chat groups
 */
function groupByDate(chats: ChatResource[]): ChatGroup[] {
    const todayStart = DateTime.local().startOf('day');
    const baseGroups = [
        new ChatGroupBuilder(
            'Today',
            todayStart,
        ),
        new ChatGroupBuilder(
            'Last 7 days',
            todayStart.minus(Duration.fromObject({days: 7})),
        ),
        new ChatGroupBuilder(
            'Last 30 days',
            todayStart.minus(Duration.fromObject({days: 30})),
        ),
        new ChatGroupBuilder(
            'Older',
            null,
        ),
    ];

    for (const chat of chats) {
        for (const group of baseGroups) {
            if (group.addIfValid(chat)) {
                break;
            }
        }
    }
    return baseGroups
        .filter(g => !g.empty)
        .map(g => g.build());
}


export default function ChatList({chats}: { chats: ChatResource[] }) {
    let list: ReactNode;
    if (chats.length === 0) {
        list = (
            <p>No chat found for this page.</p>
        );
    } else {
        list = (
            <>
                {
                    groupByDate(chats).map((group) => (<ChatListGroup group={group} key={group.name}/>))
                }
            </>
        );
    }
    return (
        <div className="flex flex-col items-stretch justify-center w-full max-w-full gap-4">
            {list}
        </div>
    );
}