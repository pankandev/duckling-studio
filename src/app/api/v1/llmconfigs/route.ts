import {prisma} from "@/lib/server/db/client";
import {buildListItemResponse} from "@/lib/common/http/rest-response";
import {LLMConfigSchema} from "@/lib/common/resources/llm-config";


export async function GET(): Promise<Response> {
    const configs = await prisma.lLMConfig.findMany({
        orderBy: {
            lastUsed: 'desc',
        }
    });

    return buildListItemResponse(
        configs.map(m => LLMConfigSchema.parse(m)),
    );
}