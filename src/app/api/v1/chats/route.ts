import {z} from "zod";

import {generateText} from "ai";
import {buildListItemResponse, buildSingleItemResponse} from "@/lib/common/http/rest-response";
import {DefaultLLM} from "@/lib/server/ai/llm";
import {HttpError} from "@/lib/common/http/http-error";
import {prisma} from "@/lib/server/db/client";


export async function generateChatNameFromMessage(message: string): Promise<string> {
    const systemMessage = "" +
        "You will receive a message from a chat" +
        "Your role is to create a title about the topic" +
        "this chat will be about." +
        "" +
        "Do not include quotes around the name" +
        "" +
        "Examples:" +
        "why is keras not as used as pytorch or tensorflow? -> Keras vs PyTorch Tensorflow " +
        "In nextjs I want to be able to submit the form when the user presses enter on the textarea, any ideas? -> Submit form on Enter" +
        "What are some RAG techniques for caching? -> RAG Caching Techniques" +
        "I am writing a description fro my linkedin, is this ok? -> LinkedIn Description Refinement" +
        "Give me ideas for a TTRPG session for Cyberpunk Red. -> Cyberpunk Red Session Ideas";
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
