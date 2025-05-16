import {getMLTasksAPIURL} from "@/lib/server/mltasks/api";
import {HttpError} from "@/lib/common/http/http-error";
import {z} from "zod";
import {buildListItemResponse} from "@/lib/common/http/rest-response";
import {DatasetModelResourceSchema} from "@/lib/common/resources/dataset-resource";
import {safeParseInt} from "@/lib/common/parsers/primitives";

const MLModelItemResponse = z.object({
    items: z.array(DatasetModelResourceSchema),
});

export async function GET(request: Request, {params}: {params: Promise<{datasetId: string}>}): Promise<Response> {
    const datasetIdRaw = (await params).datasetId;
    const datasetIdParse = safeParseInt(datasetIdRaw);
    if (!datasetIdParse.success) {
        return HttpError.badRequestZod(datasetIdParse.error).asResponse();
    }
    const datasetId = datasetIdParse.data;

    const response = await fetch(
        getMLTasksAPIURL(`/datasets/${datasetId}/models`),
        {
            method: 'GET'
        }
    );
    const data = await response.json();
    const parsedResponse = MLModelItemResponse.parse(data);
    return buildListItemResponse(parsedResponse.items);
}