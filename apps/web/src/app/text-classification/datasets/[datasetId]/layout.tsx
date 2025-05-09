'use client';

import React, {use} from 'react';
import Link from "next/link";
import {Brain, List} from "lucide-react";
import {Button} from "@/components/ui/button";

const DatasetDetailsPage = ({children, params: paramsReact}: {children: React.ReactNode, params: Promise<{ datasetId: number }> }) => {
    const params = use(paramsReact);

    return (
        <div className="flex flex-col gap-2">
            <h2>Dataset Details Page</h2>
            <div className="flex flex-row items-center justify-start py-3 gap-2">
                <Button asChild variant="ghost" className="text-sm flex flex-row justify-between items-center">
                    <Link href={`/text-classification/datasets/${params.datasetId}/items`}>
                        <List size={16}></List>
                        <span>
                            Items
                        </span>
                    </Link>
                </Button>
                <Button asChild variant="ghost" className="text-sm flex flex-row justify-between items-center">
                    <Link href={`/text-classification/datasets/${params.datasetId}/models`}>
                        <Brain size={16}></Brain>
                        <span>
                            Classification Models
                        </span>
                    </Link>
                </Button>
            </div>
            {children}
        </div>
    );
};

export default DatasetDetailsPage;