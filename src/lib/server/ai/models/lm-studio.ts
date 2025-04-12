import {ModelFactory} from "@/lib/server/ai/models/model-factory";
import {LanguageModelV1} from "ai";
import type {OpenAICompatibleProvider} from "@ai-sdk/openai-compatible";

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
        return provider('claude-3-7-sonnet-20250219');
    }
}