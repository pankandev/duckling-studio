import React from 'react';
import {DatasetModelResource} from "@/lib/common/resources/dataset-resource";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

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
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    );
};

export default DatasetModelsTable;