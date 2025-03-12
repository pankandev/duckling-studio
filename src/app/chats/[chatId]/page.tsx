import Link from "next/link";
import MessageList from "@/app/chats/[chatId]/components/message-list";


export default function Page() {
    const db = getDb();
    return (
        <div>
            <Link href={('/chats')}>
                Volver
            </Link>
            <MessageList></MessageList>
        </div>
    )
}