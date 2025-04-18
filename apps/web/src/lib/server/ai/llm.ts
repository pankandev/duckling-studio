import {CoreMessage, LanguageModelV1} from "ai";

import {ChatMessage} from "@prisma/client";
import {ModelFactory} from "@/lib/server/ai/models/model-factory";
import {ClaudeAIFactory} from "./models/claude-ai";
import {LMStudioFactory} from "@/lib/server/ai/models/lm-studio";
import {OpenAIFactory} from "@/lib/server/ai/models/openai";
import {OllamaFactory} from "@/lib/server/ai/models/ollama";
import {err, ok, Result} from "@/lib/common/result";
import {HttpError} from "@/lib/common/http/http-error";
import {LLMModelResource} from "@/lib/common/resources/llm-model";


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


function getModelFactory(providerId: string): ModelFactory | null {
    const modelFactoryMap: Record<string, ModelFactory | undefined> = ModelFactoryByProviderHandle;
    return modelFactoryMap[providerId] ?? null;
}

export async function loadModel(providerId: string, modelId?: string): Promise<LanguageModelV1 | null> {
    const factory = getModelFactory(providerId);
    if (!factory) {
        return null;
    }
    return modelId ?
        await factory.create(modelId) :
        factory.getDefault();
}

export async function doesModelExist(providerId: string, modelId: string): Promise<boolean> {
    const factory = getModelFactory(providerId);
    if (!factory) {
        return false;
    }

    const models = await factory.listModels();
    return models.contains(modelId);
}

export async function listModels(providerHandle: string): Promise<Result<LLMModelResource[]>> {
    const factory = getModelFactory(providerHandle);
    if (!factory) {
        return err(HttpError.notFound('llm-provider', {providerHandle: providerHandle}))
    }
    try {
        const models = await factory.listModels();
        return ok(models.array);
    } catch {
        return err(HttpError.conflict('bad-configuration', `Bad configuration for provider: ${providerHandle}`));
    }
}
