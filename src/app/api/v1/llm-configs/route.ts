import {prisma} from "@/lib/server/db/client";
import {buildListItemResponse, buildSingleItemResponse} from "@/lib/common/http/rest-response";
import {LLMConfigCreate, LLMConfigSchema} from "@/lib/common/resources/llm-config";
import {HttpError} from "@/lib/common/http/http-error";


export async function GET(): Promise<Response> {
    const configs = await prisma.lLMConfig.findMany({
        orderBy: {
            lastUsed: 'desc',
        },
        include: {
            provider: true,
        }
    });

    return buildListItemResponse(
        configs.map(m => LLMConfigSchema.parse(m)),
    );
}

export async function POST(request: Request): Promise<Response> {
    const bodyRaw = await request.json();
    const bodyParseResult = LLMConfigCreate.safeParse(bodyRaw);
    if (!bodyParseResult.success) {
        return HttpError.badRequestZod(bodyParseResult.error).asResponse();
    }

    return prisma.$transaction(async (t) => {
        const provider = await t.lLMProvider.findFirst({
            where: {
                handle: bodyParseResult.data.providerHandle,
            },
            select: {
                id: true,
            }
        });

        if (!provider) {
            return HttpError.notFound('llm-provider', {handle: bodyParseResult.data.providerHandle}).asResponse();
        }

        const config = await t.lLMConfig.create({
            data: {
                providerId: provider.id,
                model: bodyParseResult.data.model,
            },
            include: {
                provider: true,
            }
        });

        console.log(config);
        return buildSingleItemResponse(LLMConfigSchema.parse(config));
    })
}
