import React from 'react';
import {DatasetItemResource} from "@/lib/common/resources/dataset-resource";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

const DatasetItemsTable = ({items}: {items: DatasetItemResource[]}) => {
    return (
        <Table>
            <TableCaption>Dataset Items</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Text</TableHead>
                    <TableHead>Label</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium overflow-hidden max-w-[50rem] whitespace-nowrap text-ellipsis hover:whitespace-normal">{item.textContent}</TableCell>
                            <TableCell className={
                                'min-w-[5rem] text-right' + (item.label ? '' : ' italic text-muted')
                            }>
                                {item.label ?
                                    item.label.label :
                                    'Unlabeled'
                                }
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    );
};

export default DatasetItemsTable;