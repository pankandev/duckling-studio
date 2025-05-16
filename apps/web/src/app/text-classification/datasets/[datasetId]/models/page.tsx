'use client';

import React, {use} from 'react';
import {useDatasetModels} from "@/lib/client/api/datasets";
import DatasetModelsTable from "@/components/datasets/dataset-models-table";

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

    return (
        <>
            {child}
        </>
    );
};
export default DatasetModelsPage;