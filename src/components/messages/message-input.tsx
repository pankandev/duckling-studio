import {z} from "zod";
import Form from "next/form";
import React, {useCallback} from "react";
import { ChatMessageInput } from "@/lib/client/types/chats";


export default function MessageInput({onSend, disabled}: {onSend: (message: ChatMessageInput) => unknown, disabled: boolean }) {
    function emitValue(form: FormData) {
        const content = z.string().min(1).safeParse(form.get('content'));
        if (!content.success) {
            return;
        }
        onSend({
            content: content.data,
        });
    }

    const onKeyDown = useCallback((evt: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (evt.key === 'Enter' && !evt.shiftKey) {
            evt.preventDefault();

            evt.currentTarget.form?.requestSubmit();
        }
    }, []);

    return (
        <Form className="flex flex-row" action={emitValue}>
            <textarea
                name="content"
                className="rounded-l-2xl bg-gray-950 px-4 py-2 resize-y grow min-h-6"
                onKeyDown={onKeyDown}
            />
            <button
                className="btn rounded-r-2xl bg-gray-600 hover:bg-gray-700 active:bg-gray-950 pl-4 pr-5 py-2 disabled:bg-gray-950"
                disabled={disabled}
                type="submit"
            >
                Send
            </button>
        </Form>
    );
}