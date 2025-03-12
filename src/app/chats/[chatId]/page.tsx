import Link from "next/link";


export default function Page() {
    return (
        <div>
            <Link href={('/chats')}>
                Volver
            </Link>
        </div>
    )
}