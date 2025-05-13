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

export interface DatasetModelResource {
    id: string;
    status: string;
    config: Record<string, unknown>;
    trainAccuracy: number;
    evaluationAccuracy: number;
    mlflowPath: string | null;
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

export const DatasetModelResourceSchema: z.ZodSchema<DatasetModelResource, z.ZodTypeDef, unknown> = z.object({
    id: z.string(),
    status: z.string(),
    metrics: z.record(z.any()),
    mlflowPath: z.string().nullable(),
    config: z.record(z.unknown()),
    trainAccuracy: z.number(),
    evaluationAccuracy: z.number(),
});
