import {z} from "zod";
import Form from "next/form";
import React, {useCallback, useRef, useState} from "react";
import {ChatMessageInput} from "@/lib/client/types/chats";
import LLMConfigSelect from "@/components/messages/llm-config-select";
import {useChatLLMConfig} from "@/lib/client/providers/chat-llm-config";
import {Button} from "@/components/ui/button";
import TextArea from "@/components/inputs/text-area";
import {Send} from "lucide-react";


export default function MessageInput({onSend, disabled}: {
    onSend: (message: ChatMessageInput) => unknown,
    disabled: boolean
}) {
    const form = useRef<HTMLFormElement>(null);
    const config = useChatLLMConfig();

    const [chatContent, setChatContent] = useState("");

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
        setChatContent('');
    }, [config, onSend]);

    const requestSubmit = useCallback(() => {
        form.current?.requestSubmit();
    }, [form]);

    return (
        <div className="flex flex-col items-stretch gap-2">
            <Form ref={form} className="flex flex-row items-stretch w-full" action={submit}>
                <div className="flex flex-row items-stretch grow">
                    <TextArea
                        id="content"
                        value={chatContent}
                        className="bg-transparent border-b border-r-transparent border-b-border border-t border-t-border rounded-l-2xl px-4 py-2 grow"
                        onSubmitRequest={requestSubmit}
                        onChange={v => setChatContent(v)}
                    />
                    <Button
                        className="rounded-l-none rounded-r-2xl h-full w-[5rem]"
                        disabled={disabled || chatContent.length === 0}
                        type="submit"
                    >
                        <Send></Send>
                    </Button>
                </div>
            </Form>
            <div className="flex flex-row">
                <LLMConfigSelect></LLMConfigSelect>
            </div>
        </div>
    );
}