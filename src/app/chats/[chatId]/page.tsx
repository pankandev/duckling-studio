import Chat from "@/components/chat";


export default async function Page({params}: {params: Promise<{chatId: string}>}) {
    const chatIdString = (await params).chatId;
    const chatId = parseInt(chatIdString, 10);

    return <Chat chatId={chatId}></Chat>
}