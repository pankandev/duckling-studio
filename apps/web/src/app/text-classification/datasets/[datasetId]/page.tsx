'use client';

import React, {use} from 'react';
import {useDatasetItems} from "@/lib/client/api/datasets";
import DatasetItemsTable from "@/components/datasets/dataset-items-table";

const DatasetDetailsPage = ({params: paramsReact}: { params: Promise<{ datasetId: number }> }) => {
    const params = use(paramsReact);
    const {
        data: datasetItemsResult
    } = useDatasetItems(params.datasetId);

    let child: React.ReactNode;
    if (!datasetItemsResult) {
        child = <div>Loading...</div>;
    } else if (!datasetItemsResult.success) {
        child = <div>Error</div>
    } else {
        child = <DatasetItemsTable items={datasetItemsResult.value}/>;
    }

    return (
        <div className="flex flex-col gap-2">
            <h2>Dataset Details Page</h2>
            {child}
        </div>
    );
};

export default DatasetDetailsPage;