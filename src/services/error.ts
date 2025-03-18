export class AppError {
    constructor(
        public readonly code: string,
        public readonly message: string,
        public readonly details: Record<string, unknown> = {},
    ) {
    }

    static notFoundCode = 'not-found';

    /**
     * Creates an AppError for a missing resource.
     *
     * Will create an app error with code 'not-found' and under which attributes it
     * could not be found.
     *
     * @param resource The resource being searched for (e.g. 'chat')
     * @param attributesQuery Under which query the resource was searched for (e.g. {id: 2})
     */
    static notFound(
        resource: string,
        attributesQuery: Record<string, {toString(): string}>,
    ): AppError {
        const queryMessages: string[] = [];
        for (const key in attributesQuery) {
            const value = attributesQuery[key];
            queryMessages.push(`${key}=\"${value.toString()}\"`);
        }

        const message = `Resource ${resource} with ${queryMessages.join(' and ')} could not be found`;

        return new AppError(
            this.notFoundCode,
            message,
            {
                query: attributesQuery,
            }
        )
    }
}


