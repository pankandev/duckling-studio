import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Group, MessageCircle} from "lucide-react";

export default function Home() {
    return (
        <div>
            <main>
                <div className="flex flex-col items-center py-16 gap-8">
                    <h1 className="font-bold text-3xl">Duckling Studio</h1>
                    <div className="flex flex-row flex-wrap gap-6">
                        <Button asChild variant="outline"
                                className="w-[10rem] max-w-full aspect-square h-auto flex flex-col gap-0.5">
                            <Link href={'/chats/new'} passHref>
                                <MessageCircle size={32}></MessageCircle>
                                <span>Chat</span>
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="w-[10rem] max-w-full aspect-square h-auto flex flex-col gap-0.5"
                            disabled
                        >
                            <Group></Group>
                            <span>Model Management</span>
                            <span className="text-muted">Soon</span>
                        </Button>
                    </div>
                </div>
            </main>
            <footer>
            </footer>
        </div>
    );
}
