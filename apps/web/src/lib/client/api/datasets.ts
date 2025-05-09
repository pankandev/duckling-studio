import useSWR, {SWRResponse} from "swr";
import {Result} from "@/lib/common/result";
import {buildListItemFetcher} from "@/lib/client/swr/buildGetItemFetcher";
import {
    DatasetItemResource,
    DatasetItemResourceSchema, DatasetModelResource, DatasetModelResourceSchema,
    DatasetResource,
    DatasetResourceSchema
} from "@/lib/common/resources/dataset-resource";


export function useDatasets(): SWRResponse<Result<DatasetResource[]>> {
    return useSWR('/api/v1/datasets', buildListItemFetcher(DatasetResourceSchema));
}

export function useDatasetItems(datasetId: number): SWRResponse<Result<DatasetItemResource[]>> {
    return useSWR(`/api/v1/datasets/${datasetId}/items?limit=10`, buildListItemFetcher(DatasetItemResourceSchema));
}

export function useDatasetModels(datasetId: number): SWRResponse<Result<DatasetModelResource[]>> {
    return useSWR(`/api/v1/datasets/${datasetId}/models?limit=10`, buildListItemFetcher(DatasetModelResourceSchema));
}
