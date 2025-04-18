'use client'

import {ReactNode, useCallback, useState} from "react";
import MarkdownIt from 'markdown-it';
import {ChatMessageResource} from "@/lib/common/resources/chat-message-resource";
import TextArea from "@/components/inputs/text-area";
import {ChatMessageUpdateBody} from "@/lib/client/types/chats";
import {err, ok, Result} from "@/lib/common/result";
import {HttpError} from "@/lib/common/http/http-error";
import {Button} from "../ui/button";
import {Pencil, Trash} from "lucide-react";

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
    const isUser = message.role === 'USER';
    const topContainerClassNames = isUser ? 'items-end' : 'items-stretch'

    if (isDeleting) {
        return (<></>);
    }
    return (
        <div className={'flex flex-col gap-1 ' + topContainerClassNames}>
            <div className={'chat-message flex flex-col message-' + message.role.toLowerCase()}>
                {
                    isEditing ? (
                        <TextArea
                            className="w-full"
                            value={message.content}
                            onSubmitRequest={editMessageCallback}
                            onBlur={editMessageCallback}
                            onEscape={() => setEditing(false)}
                            disabled={isUpdating}
                        />
                    ) : (<div className="message-content-markdown"
                              dangerouslySetInnerHTML={{__html: markdownIt.render(message.content)}}>
                    </div>)
                }
            </div>
            <div
                className={'chat-message-tools flex flex-row gap-2 text-sm ' + (isUser ? 'justify-end' : 'justify-start')}>
                {!isEditing && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditing(!isEditing)}
                        >
                            <Pencil size={4}></Pencil>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={deleteMessageCallback}
                        >
                            <Trash></Trash>
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}