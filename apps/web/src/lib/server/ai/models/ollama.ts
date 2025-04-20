import {LLMModelArray, ModelFactory} from "@/lib/server/ai/models/model-factory";
import {LanguageModelV1} from "ai";
import type {OllamaProvider} from "ollama-ai-provider";
import {HashedArray} from "@/lib/common/data-structures/hashed-array";


export class OllamaFactory implements ModelFactory {
    constructor(
        private readonly url: string = 'http://localhost:11434',
    ) {
    }

    private static async load(url: string): Promise<OllamaProvider> {
        const ai = await import("ollama-ai-provider");
        return ai.createOllama({
            baseURL: url
        });
    }

    async create(model: string): Promise<LanguageModelV1> {
        const provider = await OllamaFactory.load(this.url);
        return provider(model);
    }

    async getDefault(): Promise<LanguageModelV1> {
        const provider = await OllamaFactory.load(this.url);
        return provider('llama3.2');
    }

    async listModels(): Promise<LLMModelArray> {
        const {Ollama} = await import("ollama");
        const ollama = new Ollama({
            host: this.url,
        });
        const response = await ollama.list();
        const models: LLMModelArray = new HashedArray(m => m.id);
        for await (const model of response.models) {
            models.push({
                id: model.model,
                name: model.name,
            });
        }

        return models;
    }
}