import {CoreMessage} from "ai";
import {ChatMessageCreateManyInput} from "@/services/chats";

export function aiSdkToInsertMessageDb(message: CoreMessage, chatId: number): ChatMessageCreateManyInput {
    const contentRaw = message.content;

    let content: string;
    if (!Array.isArray(contentRaw)) {
        content = contentRaw;
    } else {
        content = contentRaw
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join("\n");
    }
    return {
        chatId: chatId,
        role: message.role === 'user' ? 'USER' : 'ASSISTANT',
        content: content,
        extraData: {},
    };
}

export function aiSdkToInsertMessageDbList(messages: CoreMessage[], chatId: number): ChatMessageCreateManyInput[] {
    return messages.map(m => aiSdkToInsertMessageDb(m, chatId));
}
