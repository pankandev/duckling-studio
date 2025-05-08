import {safeParseInt} from "@/lib/common/parsers/primitives";
import {HttpError} from "@/lib/common/http/http-error";
import {getMLTasksAPIURL} from "@/lib/server/mltasks/api";
import {z} from "zod";
import {DatasetItemResource} from "@/lib/common/resources/dataset-resource";
import {buildListItemResponse} from "@/lib/common/http/rest-response";

const QueryParamsSchema = z.object({
    limit: z.coerce.number().min(1).max(100).catch(() => 100),
    offset: z.coerce.number().min(0).catch(() => 0),
});

const MLDatasetItem = z.object({
    id: z.number(),
    text_content: z.string(),
    label: z.object({
        id: z.string(),
        label: z.string(),
    }),
});

const MLDatasetItemResponse = z.object({
    items: z.array(MLDatasetItem),
});

function mlDatasetItemToResource(item: z.infer<typeof MLDatasetItem>): DatasetItemResource {
    return {
        id: item.id,
        textContent: item.text_content,
        label: item.label ? {
            label: item.label.label,
            id: item.label.id
        } : null
    };
}

export async function GET(request: Request, {params}: {params: Promise<{datasetId: string}>}): Promise<Response> {
    const datasetIdRaw = (await params).datasetId;
    const datasetIdParse = safeParseInt(datasetIdRaw);
    if (!datasetIdParse.success) {
        return HttpError.badRequestZod(datasetIdParse.error).asResponse();
    }
    const datasetId = datasetIdParse.data;

    const {searchParams} = new URL(request.url);
    const queryParamsRaw = Object.fromEntries(searchParams.entries());
    const queryParams = QueryParamsSchema.parse(queryParamsRaw);
    console.log(queryParamsRaw, queryParams)

    const response = await fetch(
        getMLTasksAPIURL(`/datasets/${datasetId}/items?offset=${queryParams.offset}&limit=${queryParams.limit}`),
        {
            method: 'GET',
        }
    );
    if (!response.ok) {
        throw await HttpError.fromResponse(response);
    }

    const responseParse = MLDatasetItemResponse.parse(await response.json());
    return buildListItemResponse(responseParse.items.map(
        item => mlDatasetItemToResource(item)
    ));
}
