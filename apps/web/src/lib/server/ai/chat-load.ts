import {err, ok, Result} from "@/lib/common/result";
import {prisma} from "@/lib/server/db/client";
import {HttpError} from "@/lib/common/http/http-error";
import {LanguageModelV1} from "ai";
import {loadModel} from "@/lib/server/ai/llm";

export interface ChatConfiguration {
    systemMessage: string | null;
}

export async function loadChatConfigModel(configId: number): Promise<Result<LanguageModelV1>> {
    const config = await prisma.lLMConfig.findFirst({
        where: {id: configId},
        include: {
            provider: true,
        }
    });
    if (!config) {
        return err(
            HttpError.notFound(
                'llm-config',
                {
                    id: configId,
                }
            )
        );
    }

    const model = await loadModel(config.provider.handle, config.model);
    if (!model) {
        return err(
            HttpError.notFound(
                'llm-model',
                {
                    provider: config.provider.handle,
                    model: config.model
                })
        );
    }
    return ok(model)
}


/**
 * Loads a chat configuration from the database.
 *
 * This includes AI.SDK model.
 * @param chatId The chat id.
 *
 * @returns A {@link Result} object with the {@link ChatConfiguration}
 */
export async function loadChatConfiguration(chatId: number): Promise<Result<ChatConfiguration>> {
    const chat = await prisma.chat.findFirst({
        where: {id: chatId},
        select: {
            systemMessage: true,
        }
    });
    if (chat === null) {
        return err(
            HttpError.notFound(
                'chat',
                {id: chatId},
            ),
        );
    }

    return ok({
        systemMessage: chat.systemMessage,
    });
}
