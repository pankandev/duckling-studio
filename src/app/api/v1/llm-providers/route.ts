import {prisma} from "@/lib/server/db/client";
import {buildListItemResponse} from "@/lib/common/http/rest-response";
import {LLMProviderSchema} from "@/lib/common/resources/llm-config";


export async function GET(): Promise<Response> {
    const providers = await prisma.lLMProvider.findMany({
        orderBy: {
            handle: 'desc',
        }
    });

    return buildListItemResponse(
        providers.map(m => LLMProviderSchema.parse(m)),
    );
}
