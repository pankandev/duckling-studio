import {LLMModelArray, ModelFactory} from "@/lib/server/ai/models/model-factory";
import {LanguageModelV1} from "ai";
import type {OpenAIProvider} from "@ai-sdk/openai";
import {HashedArray} from "@/lib/common/data-structures/hashed-array";
import {DateTime} from "luxon";

export class OpenAIFactory implements ModelFactory {
    private static async load(): Promise<OpenAIProvider> {
        const ai = await import("@ai-sdk/openai");
        return ai.openai;
    }

    async create(model: string): Promise<LanguageModelV1> {
        const provider = await OpenAIFactory.load();
        return provider(model);
    }

    async getDefault(): Promise<LanguageModelV1> {
        const provider = await OpenAIFactory.load();
        return provider('gpt-4o');
    }

    #modelsCache: LLMModelArray | null = null;
    #lastCache = DateTime.now().minus({years: 7});

    async listModels(): Promise<LLMModelArray> {
        const cacheIsStale = Math.abs(this.#lastCache.diffNow().as('hours')) > 1;
        if (this.#modelsCache !== null && !cacheIsStale) {
            return this.#modelsCache;
        }
        const {OpenAI} = await import("openai");
        const openai = new OpenAI();
        const response = await openai.models.list();
        const models: LLMModelArray = new HashedArray(m => m.id);
        for await (const page of response.iterPages()) {
            for (const model of page.data) {
                models.push({
                    id: model.id,
                    name: model.id
                });
            }
        }
        this.#modelsCache = models;
        return models;
    }
}