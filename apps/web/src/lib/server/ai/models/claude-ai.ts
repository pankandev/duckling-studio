import {LLMModelArray, ModelFactory} from "@/lib/server/ai/models/model-factory";
import {LanguageModelV1} from "ai";
import type {AnthropicProvider} from "@ai-sdk/anthropic";
import {AnthropicMessagesModelId} from "@ai-sdk/anthropic/internal";
import {HashedArray} from "@/lib/common/data-structures/hashed-array";

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

    #modelsCache: LLMModelArray | null = null;

    async listModels(): Promise<LLMModelArray> {
        if (this.#modelsCache !== null) {
            return this.#modelsCache;
        }
        const {Anthropic} = await import("@anthropic-ai/sdk");
        const anthropic = new Anthropic();
        const response = await anthropic.models.list({limit: 100});
        const models: LLMModelArray = new HashedArray(m => m.id);
        for await (const page of response.iterPages()) {
            for (const model of page.data) {
                models.push({
                    id: model.id,
                    name: model.display_name
                });
            }
        }
        this.#modelsCache = models;
        return models;
    }
}