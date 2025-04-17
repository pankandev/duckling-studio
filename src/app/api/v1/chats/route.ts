import {z} from "zod";

import {generateText, LanguageModelV1} from "ai";
import {buildListItemResponse, buildSingleItemResponse} from "@/lib/common/http/rest-response";
import {HttpError} from "@/lib/common/http/http-error";
import {prisma} from "@/lib/server/db/client";
import {loadModel} from "@/lib/server/ai/llm";
import {ChatResourceSchema} from "@/lib/common/resources/chat-resource";


export async function generateChatNameFromMessage(message: string, model: LanguageModelV1): Promise<string> {
    const systemMessage = "" +
        "You will receive a message from a chat\n\n" +
        "Your role is to create a title about the topic\n" +
        "this chat will be about.\n" +
        "\n" +
        "Do not include quotes around the name\n" +
        "\n" +
        "Examples:\n" +
        "why is keras not as used as pytorch or tensorflow? -> Keras vs PyTorch Tensorflow\n" +
        "In nextjs I want to be able to submit the form when the user presses enter on the textarea, any ideas? -> Submit form on Enter\n" +
        "What are some RAG techniques for caching? -> RAG Caching Techniques\n" +
        "I am writing a description fro my linkedin, is this ok? -> LinkedIn Description Refinement\n" +
        "Give me ideas for a TTRPG session for Cyberpunk Red. -> Cyberpunk Red Session Ideas\n";
    const response = await generateText({
        model: model,
        system: systemMessage,
        prompt: message
    });
    return response.text;
}

const CreateChatSchema = z.object({
    initialMessage: z.string(),
    configId: z.number().int(),
});

export async function POST(request: Request): Promise<Response> {
    const bodyParseResult = CreateChatSchema.safeParse(await request.json());
    if (!bodyParseResult.success) {
        return HttpError.badRequestZod(bodyParseResult.error).asResponse();
    }

    const chatConfig = await prisma.lLMConfig.findFirst({
        where: {
            id: bodyParseResult.data.configId
        },
        select: {
            model: true,
            provider: true,
        }
    });

    if (!chatConfig) {
        return HttpError.notFound(
            'llm-config',
            {
                id: bodyParseResult.data.configId
            }).asResponse();
    }

    const model = await loadModel(chatConfig.provider.handle, chatConfig.model);
    if (!model) {
        return HttpError.notFound(
            'llm-model',
            {
                provider: chatConfig.provider.handle,
                model: chatConfig.model
            }).asResponse();
    }
    const chat = await prisma.chat.create({
        data: {
            displayName: await generateChatNameFromMessage(bodyParseResult.data.initialMessage, model),
        }
    });

    return buildSingleItemResponse(chat);
}

export async function GET(): Promise<Response> {
    const chats = await prisma.chat.findMany({
        orderBy: [
            {
                createdAt: 'desc'
            },
        ],
    });

    return buildListItemResponse(chats.map(c => ChatResourceSchema.parse(c)));
}
