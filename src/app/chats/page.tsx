import React from 'react';
import Link from "next/link";

export default function ChatsPage() {
    return (
        <div>
            <Link href={('/')}>
                Volver
            </Link>
            <div className="flex flex-col items-center justify-center">
                <ul>

                </ul>
            </div>
        </div>
    );
}