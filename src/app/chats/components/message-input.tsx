import Form from "next/form";
import {z} from "zod";
import {ChatMessageInput} from "@/services/chats";


export const ChatMessageInputSchema: z.ZodSchema<ChatMessageInput> = z.object({
    content: z.string()
});

export default function MessageInput({onSend, disabled}: {onSend: (message: ChatMessageInput) => unknown, disabled: boolean }) {
    async function emitValue(formData: FormData) {
        const input = ChatMessageInputSchema.parse(Object.fromEntries([...formData.entries()]));
        onSend(input);
    }

    return (
        <Form action={emitValue} disabled={disabled}>
            <input type="text" name="content"></input>
            <button type="submit">Send</button>
        </Form>
    );
}