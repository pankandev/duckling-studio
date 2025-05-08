import {z} from "zod";

export interface DatasetLabelLiteResource {
    id: string;
    label: string;
}

export interface DatasetLabelResource extends DatasetLabelLiteResource {
    itemCount: number;
}

export interface DatasetResource {
    displayName: string;
    id: number;
    labels: DatasetLabelResource[];
}

export interface DatasetItemResource {
    id: number,
    textContent: string;
    label: DatasetLabelLiteResource | null;
}

export const DatasetLabelLiteResourceSchema: z.ZodSchema<DatasetLabelLiteResource, z.ZodTypeDef, unknown> = z.object({
    id: z.string(),
    label: z.string(),
});

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

export const DatasetItemResourceSchema: z.ZodSchema<DatasetItemResource, z.ZodTypeDef, unknown> = z.object({
    id: z.number(),
    textContent: z.string(),
    label: DatasetLabelLiteResourceSchema.nullable(),
});
