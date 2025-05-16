import {z} from "zod";
import {DateTime} from "luxon";

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

/**
 * class ModelResultResource(BaseModel):
 *     trainAccuracy: float
 *     evaluationAccuracy: float
 *     metrics: dict[str, typing.Any]
 *
 *
 * class ModelResource(BaseModel):
 *     id: int
 *     status: ModelStatus
 *     mlflowPath: str | None
 *
 *     config: dict[str, typing.Any]
 *     createdAt: datetime.datetime
 *     updatedAt: datetime.datetime
 *
 *     result: ModelResultResource | None = None
 */

export const DatasetModelStatusSchema = z.enum(['idle', 'training', 'trained', 'failed']);
export type DatasetModelStatus = z.infer<typeof DatasetModelStatusSchema>;


export interface DatasetModelResultResource {
    trainAccuracy: number;
    evaluationAccuracy: number;
    metrics: Record<string, unknown>;
}
export interface DatasetModelResource {
    id: number;
    status: DatasetModelStatus;
    mlflowPath: string | null;
    config: Record<string, unknown>;
    result: DatasetModelResultResource | null;
    createdAt: DateTime;
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


export const DatasetModelResultResourceSchema: z.ZodSchema<DatasetModelResultResource, z.ZodTypeDef, unknown> = z.object({
    trainAccuracy: z.number(),
    evaluationAccuracy: z.number(),
    metrics: z.record(z.unknown()),
});


export const DatasetModelResourceSchema: z.ZodSchema<DatasetModelResource, z.ZodTypeDef, unknown> = z.object({
    id: z.number(),
    status: DatasetModelStatusSchema,
    mlflowPath: z.string().nullable(),
    config: z.record(z.unknown()),
    result: DatasetModelResultResourceSchema.nullable(),
    createdAt: z.string().transform(d => DateTime.fromISO(d)),
});
