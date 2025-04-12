import {ModelFactory} from "@/lib/server/ai/models/model-factory";
import {LanguageModelV1} from "ai";
import type {AnthropicProvider} from "@ai-sdk/anthropic";
import {AnthropicMessagesModelId} from "@ai-sdk/anthropic/internal";

export class ClaudeAIFactory implements ModelFactory {
    private static async load(): Promise<AnthropicProvider> {
        const ai = await import("@ai-sdk/anthropic");
        return ai.anthropic;
    }

    async create(model: AnthropicMessagesModelId): Promise<LanguageModelV1> {
        const provider = await ClaudeAIFactory.load();
        return provider(model);
    }

    async getDefault(): Promise<LanguageModelV1> {
        const provider = await ClaudeAIFactory.load();
        return provider('claude-3-7-sonnet-20250219');
    }
}