'use client';

import React, {use, useCallback} from 'react';
import {useDatasetModels} from "@/lib/client/api/datasets";
import DatasetModelsTable from "@/components/datasets/dataset-models-table";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {trainNewClassifier} from "@/lib/client/api/train-classifier";

const DatasetModelsPage = (
    {params: paramsReact}: { params: Promise<{ datasetId: number }> }
) => {
    const params = use(paramsReact);
    const {
        data: datasetItemsResult
    } = useDatasetModels(params.datasetId);

    let child: React.ReactNode;
    if (!datasetItemsResult) {
        child = <div>Loading...</div>;
    } else if (!datasetItemsResult.success) {
        child = <div>Error</div>
    } else {
        child = <DatasetModelsTable items={datasetItemsResult.value}/>;
    }


    const trainClassifier = useCallback(async () => {
        await trainNewClassifier(params.datasetId, {
            num_train_epochs: 1
        });
    }, [params.datasetId])

    return (
        <div className="flex flex-col items-stretch">
            <div className="flex flex-row justify-end">
                <Button onClick={trainClassifier}>
                    <Plus size={32}></Plus>
                    <span>Train New Classifier</span>
                </Button>
            </div>
            {child}
        </div>
    );
};
export default DatasetModelsPage;