import React from 'react';
import {DatasetModelResource, DatasetModelStatus} from "@/lib/common/resources/dataset-resource";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

const statusClassNames: Record<DatasetModelStatus, string> = {
    training: 'text-chart-4',
    trained: 'text-chart-2',
    failed: 'text-chart-5',
    idle: 'text-muted',
}

const DatasetModelsTable = ({items}: {items: DatasetModelResource[]}) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Metric Type</TableHead>
                    <TableHead>Metric Value</TableHead>
                    <TableHead>MLFlow Run Id</TableHead>
                    <TableHead>Creation Time</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell className={'italic text-muted ' + statusClassNames[item.status]}>{item.status.toUpperCase()}</TableCell>
                            <TableCell>{item.result?.metrics[0]?.type ?? '-'}</TableCell>
                            <TableCell>{item.result?.metrics[0]?.value ?? '-'}</TableCell>
                            <TableCell>{item.mlflowRunId ?? '-'}</TableCell>
                            <TableCell>{item.createdAt.toRelative()}</TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    );
};

export default DatasetModelsTable;