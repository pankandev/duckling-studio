import useSWR, {SWRResponse} from "swr";
import {Result} from "@/lib/common/result";
import {buildListItemFetcher} from "@/lib/client/swr/buildGetItemFetcher";
import {LLMConfigResource, LLMConfigSchema} from "@/lib/common/resources/llm-config";


export function useLLMConfigs(): SWRResponse<Result<LLMConfigResource[]>> {
    return useSWR('/api/v1/llmconfigs', buildListItemFetcher(LLMConfigSchema));
}