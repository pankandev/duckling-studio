import {safeParseInt} from "@/lib/common/parsers/primitives";
import {HttpError} from "@/lib/common/http/http-error";
import {prisma} from "@/lib/server/db/client";
import {buildOkResponse} from "@/lib/common/http/rest-response";


export async function DELETE(_: Request, {params}: {params: Promise<{chatId: string}>}): Promise<Response> {
    const chatIdParse = safeParseInt((await params).chatId);
    if (!chatIdParse.success) {
        return HttpError.badRequestZod(chatIdParse.error).asResponse();
    }
    const chatId = chatIdParse.data;

    const r = await prisma.chat.delete({
        where: {id: chatId},
    });
    console.log(r);

    return buildOkResponse();
}
