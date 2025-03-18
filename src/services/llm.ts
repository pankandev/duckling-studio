import {CoreMessage, generateText, LanguageModel} from "ai";
import {anthropic} from '@ai-sdk/anthropic';
import {ChatMessage} from "@prisma/client";

export type ChatMessageAiCompatible = Pick<ChatMessage, 'role' | 'content'>


export function dbMessageToAiSdk(message: ChatMessageAiCompatible): CoreMessage {
    if (message.role === 'USER') {
        return {
            role: 'user',
            content: message.content,
        };
    } else {
        return {
            role: 'assistant',
            content: message.content,
        }
    }
}

export function dbMessageListToAiSdk(messages: ChatMessageAiCompatible[]): CoreMessage[] {
    return messages.map(m => dbMessageToAiSdk(m))
}

const SystemMessage: string = (
    'Your role is to be a helpful assistant.'
);

export const DefaultLLM: LanguageModel = anthropic('claude-3-7-sonnet-20250219');

export async function continueChat(messages: ChatMessageAiCompatible[]): Promise<CoreMessage[]> {
    const messagesAi = dbMessageListToAiSdk(messages);
    const result = await generateText({
        model: DefaultLLM,
        system: SystemMessage,
        messages: messagesAi,
    });
    return [
        {
            role: 'assistant',
            content: result.text,
        }
    ];
}