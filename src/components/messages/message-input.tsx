import {z} from "zod";
import Form from "next/form";
import React, {useCallback, useRef} from "react";
import {ChatMessageInput} from "@/lib/client/types/chats";
import LLMConfigSelectIcon from "@/components/messages/llm-config-select-icon";
import {useChatLLMConfig} from "@/lib/client/providers/chat-llm-config";
import {Button} from "@/components/ui/button";
import TextArea from "@/components/inputs/text-area";


export default function MessageInput({onSend, disabled}: {onSend: (message: ChatMessageInput) => unknown, disabled: boolean }) {
    const form = useRef<HTMLFormElement>(null);
    const config = useChatLLMConfig();

    const submit = useCallback((form: FormData) => {
        if (!config.llmConfig) {
            return;
        }
        const content = z.string().min(1).safeParse(form.get('content'));
        if (!content.success) {
            return;
        }
        onSend({
            content: content.data,
            configId: config.llmConfig.id,
        });
    }, [config, onSend]);

    return (
        <Form ref={form} className="flex flex-row items-stretch" action={submit}>
            <LLMConfigSelectIcon></LLMConfigSelectIcon>
            <TextArea
                id="content"
                className="bg-transparent border-b border-b-border border-t border-t-border px-4 py-2 resize-y grow min-h-6"
                onChange={() => form.current?.requestSubmit()}
            />
            <Button
                className="rounded-l-none rounded-r-2xl h-full"
                disabled={disabled}
                type="submit"
            >
                Send
            </Button>
        </Form>
    );
}