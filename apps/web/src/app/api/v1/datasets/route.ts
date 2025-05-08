import {getMLTasksAPIURL} from "@/lib/server/mltasks/api";
import {HttpError} from "@/lib/common/http/http-error";
import {z} from "zod";
import {buildListItemResponse, buildSingleItemResponse} from "@/lib/common/http/rest-response";
import {DatasetLabelResource, DatasetResource} from "@/lib/common/resources/dataset-resource";

const FormDataSchema = z.object({
    displayName: z.string(),
    csvFile: z.instanceof(File).nullable().default(null),
});

const MLDatasetResource = z.object({
    display_name: z.string(),
    id: z.number(),
    labels: z.object({
        id: z.string(),
        item_count: z.number(),
        label: z.string(),
    }).array()
});

const MLCreateDatasetResponse = z.object({
    item: MLDatasetResource,
});


function mlDatasetToResource(dataset: z.infer<typeof MLDatasetResource>): DatasetResource {
    return {
        id: dataset.id,
        displayName: dataset.display_name,
        labels: dataset.labels.map((l): DatasetLabelResource => ({
            id: l.id,
            itemCount: l.item_count,
            label: l.label,
        })),
    };
}


export async function POST(request: Request): Promise<Response> {
    // parse incoming file
    const receivedFormData = await request.formData();

    const displayName = receivedFormData.get('displayName');
    const csvFile = receivedFormData.get('csvFile');

    const parsed = FormDataSchema.safeParse({displayName, csvFile});
    if (!parsed.success) {
        return HttpError.badRequestZod(parsed.error).asResponse();
    }

    // redirect parsed data to ML api
    const formData = new FormData();
    formData.set('display_name', parsed.data.displayName);
    if (parsed.data.csvFile !== null) {
        formData.set('csv_file', parsed.data.csvFile);
    }

    const response = await fetch(
        getMLTasksAPIURL('/datasets'),
        {
            method: 'POST',
            body: formData,
        }
    );

    const data = await response.json();
    const parsedResponse = MLCreateDatasetResponse.safeParse(data);
    if (!parsedResponse.success) {
        return HttpError.unknown(500).asResponse();
    }

    return buildSingleItemResponse(mlDatasetToResource(parsedResponse.data.item));
}


const MListDatasetResponse = z.object({
    items: MLDatasetResource.array(),
});


export async function GET(): Promise<Response> {
    const response = await fetch(
        getMLTasksAPIURL('/datasets'),
        {
            method: 'GET'
        }
    );
    const data = await response.json();
    const parsedResponse = MListDatasetResponse.parse(data);
    return buildListItemResponse(parsedResponse.items.map(mlDatasetToResource));
}
