import {LanguageModelV1} from "ai";

export interface ModelFactory {
    create(model: string): Promise<LanguageModelV1>;

    getDefault(): Promise<LanguageModelV1>;
}
