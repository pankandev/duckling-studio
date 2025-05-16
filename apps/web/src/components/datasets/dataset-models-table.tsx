import React from 'react';
import {DatasetModelResource} from "@/lib/common/resources/dataset-resource";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {json} from "node:stream/consumers";

const DatasetModelsTable = ({items}: {items: DatasetModelResource[]}) => {
    return (
        <Table>
            <TableCaption>Dataset Models</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Train Accuracy</TableHead>
                    <TableHead>Evaluation Accuracy</TableHead>
                    <TableHead>MLFlow</TableHead>
                    <TableHead>Creation Time</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell className="italic text-muted">{item.status.toUpperCase()}</TableCell>
                            <TableCell>{item.result?.trainAccuracy}</TableCell>
                            <TableCell>{item.result?.evaluationAccuracy}</TableCell>
                            <TableCell>{item.mlflowPath}</TableCell>
                            <TableCell>{item.createdAt.toFormat('yyyy-mm-dd hh:mm:ss')}</TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    );
};

export default DatasetModelsTable;