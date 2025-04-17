import {LLMModelArray, ModelFactory} from "@/lib/server/ai/models/model-factory";
import {LanguageModelV1} from "ai";
import type {OllamaProvider} from "ollama-ai-provider";
import {HashedArray} from "@/lib/common/data-structures/hashed-array";


export class OllamaFactory implements ModelFactory {
    private static async load(): Promise<OllamaProvider> {
        const ai = await import("ollama-ai-provider");
        return ai.ollama;
    }

    async create(model: string): Promise<LanguageModelV1> {
        const provider = await OllamaFactory.load();
        return provider(model);
    }

    async getDefault(): Promise<LanguageModelV1> {
        const provider = await OllamaFactory.load();
        return provider('claude-3-7-sonnet-20250219');
    }

    #modelsCache: LLMModelArray | null = null;

    async listModels(): Promise<LLMModelArray> {
        if (this.#modelsCache !== null) {
            return this.#modelsCache;
        }

        const {default: ollama} = await import("ollama");
        const response = await ollama.list();
        const models: LLMModelArray = new HashedArray(m => m.id);
        for await (const model of response.models) {
            models.push({
                id: model.model,
                name: model.name,
            });
        }

        this.#modelsCache = models;

        return models;
    }
}