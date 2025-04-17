/**
 * Creates a response for the REST API to return a single resource.
 * @param item The item to return.
 *
 * @returns The created response
 */
export function buildSingleItemResponse<T>(item: T): Response {
    return Response.json({
        item: item,
    });
}

/**
 * Creates a response for the REST API to return multiple resources.
 * @param items The items to return.
 *
 * @returns The created response
 */
export function buildListItemResponse<T>(items: T[]): Response {
    return Response.json({
        items: items,
    })
}

/**
 * Creates a simple OK response from the REST API.
 * @returns The created response
 */
export function buildOkResponse(): Response {
    return Response.json({
        ok: true,
    });
}
