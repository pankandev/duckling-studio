import {Chat} from "@prisma/client";
import {PRISMA_CLIENT} from "@/services/db";


export async function startChat(initialMessage: string): Promise<Chat> {


    const chatInput: ChatCreateInput = {
        display_name: "",
    };
    const chat = await PRISMA_CLIENT.chat.create({
        data: chatInput,
    })
}