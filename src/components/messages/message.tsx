'use client'

import {ReactNode, useCallback, useState} from "react";
import MarkdownIt from 'markdown-it';
import {ChatMessageResource} from "@/lib/common/resources/chat-message-resource";
import TextArea from "@/components/inputs/text-area";
import {ChatMessageUpdateBody} from "@/lib/client/types/chats";
import {err, ok, Result} from "@/lib/common/result";
import {HttpError} from "@/lib/common/http/http-error";

async function updateMessageContent(messageId: number, update: ChatMessageUpdateBody): Promise<Result<void>> {
    const response = await fetch(`/api/v1/messages/${messageId}/`, {
        method: "PATCH",
        body: JSON.stringify(update),
    });
    if (!response.ok) {
        return err(await HttpError.fromResponse(response));
    }
    return ok();
}

async function deleteMessage(messageId: number): Promise<Result<void>> {
    const response = await fetch(`/api/v1/messages/${messageId}/`, {
        method: "DELETE",
    });
    if (!response.ok) {
        return err(await HttpError.fromResponse(response));
    }
    return ok();
}

export default function MessageListItem(
    {
        message,
        onUpdate,
    }: {
        message: ChatMessageResource,
        onUpdate?: () => unknown
    }): ReactNode {
    const [isEditing, setEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const editMessageCallback = useCallback(async (newMessageContent: string) => {
        setIsUpdating(true);
        const result = await updateMessageContent(message.id, {
            content: newMessageContent,
        });
        if (result.success) {
            onUpdate?.();
        }
        setIsUpdating(false);
        setEditing(false);
    }, [onUpdate, message]);

    const deleteMessageCallback = useCallback(async () => {
        setIsDeleting(true);
        const result = await deleteMessage(message.id);
        if (result.success) {
            onUpdate?.();
        }
        setIsDeleting(false);
    }, [onUpdate, message]);

    const markdownIt = new MarkdownIt();
    const classNames = 'chat-message message-' + message.role.toLowerCase();

    if (isDeleting) {
        return (<></>);
    }
    return (
        <div className={classNames}>
            <div className="chat-message-tools flex flex-row-reverse gap-2">
                <button
                    className="btn text-gray-200 p-1 hover:bg-gray-200/10 rounded"
                    onClick={deleteMessageCallback}
                >
                    Delete
                </button>
                <button
                    className="btn text-gray-200 p-1 hover:bg-gray-200/10 rounded"
                    onClick={() => setEditing(!isEditing)}
                >
                    Edit
                </button>
            </div>
            {
                isEditing ? (
                    <TextArea
                        value={message.content}
                        onChange={editMessageCallback}
                        onCancel={() => setEditing(false)}
                        disabled={isUpdating}
                    />
                ) : (<div className="message-content-markdown"
                          dangerouslySetInnerHTML={{__html: markdownIt.render(message.content)}}>
                </div>)
            }
        </div>
    )
}