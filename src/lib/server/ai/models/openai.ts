import {ModelFactory} from "@/lib/server/ai/models/model-factory";
import {LanguageModelV1} from "ai";
import type {OpenAIProvider} from "@ai-sdk/openai";

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
}