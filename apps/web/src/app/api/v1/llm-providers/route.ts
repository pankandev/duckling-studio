import {prisma} from "@/lib/server/db/client";
import {buildListItemResponse} from "@/lib/common/http/rest-response";
import {LLMProviderSchema, LLMProviderWithModelsResource} from "@/lib/common/resources/llm-config";
import {listModels} from "@/lib/server/ai/llm";
import {HttpError} from "@/lib/common/http/http-error";


export async function GET(): Promise<Response> {
    const providersRaw = await prisma.lLMProvider.findMany({
        orderBy: {
            handle: 'desc',
        }
    });

    let providers: LLMProviderWithModelsResource[];
    try {
        providers = await Promise.all(
            providersRaw.map(async (m): Promise<LLMProviderWithModelsResource> => {
                const provider: Partial<LLMProviderWithModelsResource> = LLMProviderSchema.parse(m);
                const modelsResult = await listModels(provider.handle as string);
                if (!modelsResult.success) {
                    provider.models = null;
                } else {
                    provider.models = modelsResult.value;
                }
                return provider as LLMProviderWithModelsResource;
            }),
        );
    } catch (error) {
        if (error instanceof HttpError) {
            return error.asResponse();
        }
        throw error;
    }


    return buildListItemResponse(providers);
}
