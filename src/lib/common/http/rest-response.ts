/**
 * Creates a response for the REST API to return a single resource.
 * @param schema The item to return.
 *
 * @returns The created response
 */
export function buildSingleItemResponse<T>(schema: T): Response {
    return Response.json({
        item: schema,
    });
}

/**
 * Creates a response for the REST API to return multiple resources.
 * @param schema The items to return.
 *
 * @returns The created response
 */
export function buildListItemResponse<T>(schema: T): Response {
    return Response.json({
        items: schema,
    })
}
