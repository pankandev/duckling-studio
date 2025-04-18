import {safeParseInt} from "@/lib/common/parsers/primitives";
import {HttpError} from "@/lib/common/http/http-error";
import {prisma} from "@/lib/server/db/client";
import { buildOkResponse } from "@/lib/common/http/rest-response";


export async function DELETE(_: Request, {params: paramsPromise}: {
    params: Promise<{ configId: string }>
}): Promise<Response> {
    const params = await paramsPromise;
    const configIdParse = safeParseInt(params.configId);
    if (!configIdParse.success) {
        return HttpError.badRequestZod(configIdParse.error).asResponse();
    }

    await prisma.lLMConfig.delete({
        where: {
            id: configIdParse.data,
        },
        select: {
            id: true
        }
    });

    return buildOkResponse();
}
