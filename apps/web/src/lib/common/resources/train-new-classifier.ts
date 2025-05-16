import {z} from "zod";

export const ModelTypeSchema = z.enum(["hugging_face"])
export type ModelType = z.infer<typeof ModelTypeSchema>;

export interface TextClassifierTrainingArguments {
    learning_rate: number;
    dropout: number;
    attention_dropout: number;
    weight_decay: number;
    num_train_epochs: number;
    model_name: string;
    batch_size: number;
}

export interface TrainNewClassifierBody {
    type: ModelType;
    training_args: Partial<TextClassifierTrainingArguments>;
}

export const TextClassifierTrainingArgumentsSchema = z.object({
    learning_rate: z.number(),
    dropout: z.number(),
    attention_dropout: z.number(),
    weight_decay: z.number(),
    num_train_epochs: z.number(),
    model_name: z.string(),
    batch_size: z.number(),
});

export const TrainNewClassifierBodySchema: z.ZodSchema<TrainNewClassifierBody> = z.object({
    type: ModelTypeSchema,
    training_args: TextClassifierTrainingArgumentsSchema.partial(),
});
