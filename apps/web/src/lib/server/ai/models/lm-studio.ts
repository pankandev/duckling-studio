import {LLMModelArray, ModelFactory} from "@/lib/server/ai/models/model-factory";
import {LanguageModelV1} from "ai";
import type {OpenAICompatibleProvider} from "@ai-sdk/openai-compatible";
import {HashedArray} from "@/lib/common/data-structures/hashed-array";
import {HttpError} from "@/lib/common/http/http-error";

export class LMStudioFactory implements ModelFactory {
    constructor(
        private readonly baseURL: string = 'http://localhost:1234/v1',
    ) {
    }

    private static async load(baseUrl: string): Promise<OpenAICompatibleProvider> {
        const ai = await import("@ai-sdk/openai-compatible");
        return ai.createOpenAICompatible({
            name: 'lmstudio',
            baseURL: baseUrl,
        });
    }

    async create(model: string): Promise<LanguageModelV1> {
        const provider = await LMStudioFactory.load(this.baseURL);
        return provider(model);
    }

    async getDefault(): Promise<LanguageModelV1> {
        const provider = await LMStudioFactory.load(this.baseURL);
        return provider('llama3.2');
    }

    #modelsCache: LLMModelArray | null = null;

    async listModels(): Promise<LLMModelArray> {
        if (this.#modelsCache !== null) {
            return this.#modelsCache;
        }
        const response = await fetch(this.baseURL + '/models');
        const models: LLMModelArray = new HashedArray(m => m.id);
        if (!response.ok) {
            throw HttpError.unknown(500);
        }
        const {data}: { data: { id: string }[] } = await response.json();
        for await (const model of data) {
            models.push({
                id: model.id,
                name: model.id
            });
        }
        this.#modelsCache = models;
        return models;
    }
}