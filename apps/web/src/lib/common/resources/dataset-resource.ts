import {z} from "zod";
import {DateTime} from "luxon";
import {coerceDateTimeSchema} from "@/lib/common/schemas/datetime";

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

export interface DatasetModelMetricResource {
    type: string;
    value: number;
}

export interface DatasetModelResultResource {
    metrics: DatasetModelMetricResource[];
}

export interface DatasetModelResource {
    id: number;
    mlflowRunId: string | null;
    config: Record<string, unknown>;
    status: DatasetModelStatus;
    createdAt: DateTime;
    updatedAt: DateTime;
    result: DatasetModelResultResource | null;
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

export const DatasetModelMetricResourceSchema: z.ZodSchema<DatasetModelMetricResource> = z.object({
    type: z.string(),
    value: z.number(),
});

export const DatasetModelResultResourceSchema: z.ZodSchema<DatasetModelResultResource, z.ZodTypeDef, unknown> = z.object({
    metrics: z.array(DatasetModelMetricResourceSchema),
});


export const DatasetModelResourceSchema: z.ZodSchema<DatasetModelResource, z.ZodTypeDef, unknown> = z.object({
    id: z.number(),
    status: DatasetModelStatusSchema,
    mlflowRunId: z.string().nullable(),
    config: z.record(z.unknown()),
    result: DatasetModelResultResourceSchema.nullable(),
    createdAt: coerceDateTimeSchema,
    updatedAt: coerceDateTimeSchema,
});
