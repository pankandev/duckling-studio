import {CoreMessage, LanguageModel} from "ai";
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


export const DefaultLLM: LanguageModel = anthropic('claude-3-7-sonnet-20250219');
