import {z} from "zod";

import {generateText} from "ai";
import {buildListItemResponse, buildSingleItemResponse} from "@/lib/common/http/rest-response";
import {DefaultLLM} from "@/lib/server/ai/llm";
import {HttpError} from "@/lib/common/http/http-error";
import {prisma} from "@/lib/server/db/client";


export async function generateChatNameFromMessage(message: string): Promise<string> {
    const systemMessage = "" +
        "You will receive a message from a chat" +
        "Your role is to describe in a single sentence the topic" +
        "this chat will be about." +
        "" +
        "Do not include quotes around the name" +
        "" +
        "Examples:" +
        "why is keras not as used as pytorch or tensorflow? -> Keras vs PyTorch Tensorflow " +
        "I dont know what I am really looking in a job, i have a lot of criteria but no job check all the boxes -> Job criteria priorization";
    const response = await generateText({
        model: DefaultLLM,
        system: systemMessage,
        prompt: message
    });
    return response.text;
}

const CreateChatSchema = z.object({
    initialMessage: z.string(),
});

export async function POST(request: Request): Promise<Response> {
    const bodyParseResult = CreateChatSchema.safeParse(await request.json());
    if (!bodyParseResult.success) {
        return HttpError.badRequestZod(bodyParseResult.error).asResponse();
    }

    const chat = await prisma.chat.create({
        data: {
            displayName: await generateChatNameFromMessage(bodyParseResult.data.initialMessage),
        }
    });

    return buildSingleItemResponse(chat);
}

export async function GET(): Promise<Response> {
    const messages = await prisma.chat.findMany({
        orderBy: [
            {
                createdAt: 'desc'
            },
        ],
    });

    return buildListItemResponse(messages);
}
