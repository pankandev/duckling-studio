import Link from "next/link";
import Chat from "@/components/chat";


export default async function Page({params}: {params: Promise<{chatId: string}>}) {
    const chatIdString = (await params).chatId;
    const chatId = parseInt(chatIdString, 10);

    return (
        <div>
            <Link href={('/chats')}>
                Volver
            </Link>
            <Chat chatId={chatId}></Chat>
        </div>
    )
}