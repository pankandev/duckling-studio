import {ModelFactory} from "@/lib/server/ai/models/model-factory";
import {LanguageModelV1} from "ai";
import type {OllamaProvider} from "ollama-ai-provider";


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
}