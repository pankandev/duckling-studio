import {z} from "zod";

export interface DatasetLabelResource {
    id: string;
    label: string;
    itemCount: number;
}

export interface DatasetResource {
    displayName: string;
    id: number;
    labels: DatasetLabelResource[];
}

export const DatasetLabelResourceSchema: z.ZodSchema<DatasetLabelResource, z.ZodTypeDef, unknown> = z.object({
    id: z.string(),
    label: z.string(),
    itemCount: z.number(),
});

export const DatasetResourceSchema: z.ZodSchema<DatasetResource, z.ZodTypeDef, unknown> = z.object({
    displayName: z.string(),
    id: z.number(),
    labels: z.array(DatasetLabelResourceSchema),
});
