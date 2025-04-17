import useSWR, {SWRResponse} from "swr";
import {Result} from "@/lib/common/result";
import {buildListItemFetcher} from "@/lib/client/swr/buildGetItemFetcher";
import {
    LLMConfigResource,
    LLMConfigSchema,
    LLMProviderWithModelsResource,
    LLMProviderWithModelsSchema
} from "@/lib/common/resources/llm-config";


export function useLLMConfigs(): SWRResponse<Result<LLMConfigResource[]>> {
    return useSWR('/api/v1/llm-configs', buildListItemFetcher(LLMConfigSchema), {
        revalidateOnFocus: false,
    });
}

export function useLLMProviders(): SWRResponse<Result<LLMProviderWithModelsResource[]>> {
    return useSWR('/api/v1/llm-providers', buildListItemFetcher(LLMProviderWithModelsSchema), {
        revalidateOnFocus: false,
    });
}