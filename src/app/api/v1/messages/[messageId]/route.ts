import {safeParseInt} from "@/lib/common/parsers/primitives";
import {HttpError} from "@/lib/common/http/http-error";
import {prisma} from "@/lib/server/db/client";
import {buildSingleItemResponse} from "@/lib/common/http/rest-response";
import {ChatMessageUpdateBodySchema} from "@/lib/client/types/chats";

export async function PATCH(request: Request, {params}: { params: Promise<{ messageId: string }> }): Promise<Response> {
    const messageIdParse = safeParseInt((await params).messageId);
    if (!messageIdParse.success) {
        return HttpError.badRequestZod(messageIdParse.error).asResponse();
    }
    const messageId = messageIdParse.data;

    const bodyParse = ChatMessageUpdateBodySchema.safeParse(await request.json());
    if (!bodyParse.success) {
        return HttpError.badRequestZod(bodyParse.error).asResponse();
    }
    const body = bodyParse.data;

    const chatMessage = await prisma.chatMessage.update({
        where: {id: messageId},
        data: {
            content: body.content,
        }
    });

    return buildSingleItemResponse(chatMessage);
}

export async function DELETE(_: Request, {params}: { params: Promise<{ messageId: string }> }): Promise<Response> {
    const messageIdParse = safeParseInt((await params).messageId);
    if (!messageIdParse.success) {
        return HttpError.badRequestZod(messageIdParse.error).asResponse();
    }
    const messageId = messageIdParse.data;

    const chatMessage = await prisma.chatMessage.delete({
        where: {id: messageId},
    });

    return buildSingleItemResponse(chatMessage);
}
