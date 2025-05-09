import React from 'react';
import Link from "next/link";
import {ChevronRight, Home} from "lucide-react";
import {Button} from "@/components/ui/button";

const TextClassificationLayout = ({children}: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col items-stretch w-full gap-2">
            <div className="flex flex-row items-center justify-between py-3 px-5">
                <div className="flex flex-row gap-2 items-center">
                    <Button asChild variant="ghost" className="text-sm flex flex-row justify-between items-center">
                        <Link href={('/')}>
                            <Home size={16}></Home>
                            <span>
                                Home
                            </span>
                        </Link>
                    </Button>
                    <ChevronRight size={16}></ChevronRight>
                    <Button asChild variant="ghost" className="text-sm flex flex-row justify-between items-center">
                        <Link href={('/')}>
                            <Home size={16}></Home>
                            <span>
                                Text Classification
                            </span>
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="py-3 px-5">
                {children}
            </div>
        </div>
    );
};

export default TextClassificationLayout;