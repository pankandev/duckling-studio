import Link from "next/link";

export default function Home() {
    return (
        <div>
            <main>
                <Link href={'/chats/new'} passHref>
                    Chats
                </Link>
            </main>
            <footer>
            </footer>
        </div>
    );
}
