'use client';

import React from 'react';
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {useDatasets} from "@/lib/client/api/datasets";
import Link from 'next/link';

const DatasetsPage = () => {
    const {
        mutate: mutateDatasets,
        data: datasets
    } = useDatasets();

    async function createDataset(): Promise<void> {
        const formData = new FormData();
        formData.append('displayName', 'My Dataset');
        const response = await fetch('/api/v1/datasets/', {
            method: 'POST',
            body: formData,
        });
        if (response.ok) {
            await mutateDatasets();
        }
    }

    let child: React.ReactNode;
    if (!datasets) {
        child = <div>Loading...</div>;
    } else if (!datasets.success) {
        child = <div>Error</div>;
    } else {
        child = <div className="flex flex-col items-stretch w-full gap-2">
            {
                datasets.value.map(
                    dataset => (
                        <Button asChild variant="outline" key={dataset.id}>
                            <Link href={(`/text-classification/datasets/${dataset.id}`)} className="flex flex-row px-5 py-3 justify-between items-center">
                                <div className="grow font-bold">{dataset.displayName}</div>
                                <div className="italic">
                                    {
                                        dataset.labels.length > 0 ?
                                            dataset.labels.map(l => `${l.label} (${l.itemCount})`).join(', ') :
                                            'No labels'
                                    }
                                </div>
                            </Link>
                        </Button>
                    )
                )
            }
        </div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-row justify-start">
                <h2 className="font-bold">Datasets</h2>
            </div>
            <div className="flex flex-col">
                {child}
            </div>
            <div className="flex flex-row justify-end">
                <Button variant="secondary" onClick={createDataset}>
                    <Plus></Plus>
                    Create Dataset
                </Button>
            </div>
        </div>
    );
};

export default DatasetsPage;