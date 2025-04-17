import useSWR, {SWRResponse} from "swr";
import {Result} from "@/lib/common/result";
import {buildListItemFetcher} from "@/lib/client/swr/buildGetItemFetcher";
import {
    LLMConfigResource,
    LLMConfigSchema,
    LLMProviderResource,
    LLMProviderSchema
} from "@/lib/common/resources/llm-config";


export function useLLMConfigs(): SWRResponse<Result<LLMConfigResource[]>> {
    return useSWR('/api/v1/llm-configs', buildListItemFetcher(LLMConfigSchema), {
        revalidateOnFocus: false,
    });
}

export function useLLMProviders(): SWRResponse<Result<LLMProviderResource[]>> {
    return useSWR('/api/v1/llm-providers', buildListItemFetcher(LLMProviderSchema), {
        revalidateOnFocus: false,
    });
}