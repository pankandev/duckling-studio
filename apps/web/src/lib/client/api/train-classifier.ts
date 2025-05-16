import {TextClassifierTrainingArguments, TrainNewClassifierBody} from "@/lib/common/resources/train-new-classifier";

export async function trainNewClassifier(datasetId: number, args: Partial<TextClassifierTrainingArguments>): Promise<void> {
    const body: TrainNewClassifierBody = {
        type: 'hugging_face',
        training_args: args,
    };

    const response = await fetch(`/api/v1/datasets/${datasetId}/models`, {
        method: 'POST',
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(await response.json());
    }
}
