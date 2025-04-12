import {err, ok, Result} from "@/lib/common/result";
import {LanguageModelV1} from "ai";
import {prisma} from "@/lib/server/db/client";
import {HttpError} from "@/lib/common/http/http-error";
import {loadModel} from "@/lib/server/ai/llm";

export interface ChatConfiguration {
    model: LanguageModelV1;
    systemMessage: string | null;
}


/**
 * Loads a chat configuration from the database.
 *
 * This includes AI.SDK model.
 * @param chatId The chat id.
 *
 * @returns A {@link Result} object with the {@link ChatConfiguration}
 */
export async function loadChatModel(chatId: number): Promise<Result<ChatConfiguration>> {
    const chat = await prisma.chat.findFirst({
        where: {id: chatId},
        include: {
            currentConfig: {
                include: {
                    provider: {
                        select: {
                            handle: true,
                        }
                    }
                }
            }
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

    if (!chat.currentConfig) {
        return err(
            HttpError.conflict(
                'no-llm-configuration-set',
                'Chat has no LLM configuration set'
            ),
        );
    }

    const model = await loadModel(chat.currentConfig.provider.handle, chat.currentConfig.model);
    if (!model) {
        return err(
            HttpError.conflict(
                'invalid-llm-configuration',
                `Model "${chat.currentConfig.model}" for provider "${chat.currentConfig.provider.handle}" could not be loaded.`
            ),
        );
    }

    return ok({
        model,
        systemMessage: chat.systemMessage,
    });
}
