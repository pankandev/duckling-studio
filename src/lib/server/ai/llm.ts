import {CoreMessage, LanguageModelV1} from "ai";

import {ChatMessage, LLMConfig} from "@prisma/client";
import {ModelFactory} from "@/lib/server/ai/models/model-factory";
import {ClaudeAIFactory} from "./models/claude-ai";
import {LMStudioFactory} from "@/lib/server/ai/models/lm-studio";
import {OpenAIFactory} from "@/lib/server/ai/models/openai";
import {OllamaFactory} from "@/lib/server/ai/models/ollama";


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


const ModelFactoryByProviderHandle = {
    claudeai: new ClaudeAIFactory(),
    openai: new OpenAIFactory(),
    ollama: new OllamaFactory(),
    lmstudio: new LMStudioFactory(),
}


export async function loadModel(providerId: string, modelId?: string): Promise<LanguageModelV1 | null> {
    const modelFactoryMap: Record<string, ModelFactory | undefined> = ModelFactoryByProviderHandle;
    const factory = modelFactoryMap[providerId];
    if (!factory) {
        return null;
    }
    return modelId ?
        await factory.create(modelId) :
        factory.getDefault();
}
