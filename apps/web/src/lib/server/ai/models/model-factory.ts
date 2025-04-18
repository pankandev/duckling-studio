import {LanguageModelV1} from "ai";
import {HashedArray} from "@/lib/common/data-structures/hashed-array";
import {LLMModelResource} from "@/lib/common/resources/llm-model";

export type LLMModelArray = HashedArray<LLMModelResource, string>;

export interface ModelFactory {
    create(model: string): Promise<LanguageModelV1>;

    getDefault(): Promise<LanguageModelV1>;

    listModels(): Promise<LLMModelArray>;
}
