import useSWR, {SWRResponse} from "swr";
import {Result} from "@/lib/common/result";
import {buildListItemFetcher} from "@/lib/client/swr/buildGetItemFetcher";
import {DatasetResource, DatasetResourceSchema} from "@/lib/common/resources/dataset-resource";


export function useDatasets(): SWRResponse<Result<DatasetResource[]>> {
    return useSWR('/api/v1/datasets', buildListItemFetcher(DatasetResourceSchema));
}
