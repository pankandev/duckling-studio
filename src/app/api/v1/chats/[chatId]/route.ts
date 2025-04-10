import {safeParseInt} from "@/lib/common/parsers/primitives";
import {HttpError} from "@/lib/common/http/http-error";
import {prisma} from "@/lib/server/db/client";


export async function DELETE(request: Request, {params}: {params: Promise<{chatId: string}>}): Promise<Response> {
    const chatIdParse = safeParseInt((await params).chatId);
    if (!chatIdParse.success) {
        return HttpError.badRequestZod(chatIdParse.error).asResponse();
    }
    const chatId = chatIdParse.data;

    await prisma.chat.delete({
        where: {id: chatId},
    });

    return Response.json({ok: true});
}
