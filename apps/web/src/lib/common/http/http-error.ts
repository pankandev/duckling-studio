import {z, ZodError, ZodSchema} from "zod";
import {FailureResult} from "@/lib/common/result";

export interface HttpErrorBody {
    code: string;
    message: string;
    details: Record<string, unknown>;
}

export const HttpErrorBodySchema: ZodSchema<HttpErrorBody> = z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()),
})

export class HttpError extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly code: string,
        public readonly message: string,
        public readonly details: Record<string, unknown>,
    ) {
        super(message);
    }

    public static unknown(statusCode: number) {
        return new HttpError(
            statusCode,
            'unknown',
            'Unknown error',
            {}
        )
    }

    public static async fromResponse(response: Response): Promise<HttpError> {
        const detailsRaw: Record<string, unknown> = await response.json().catch(() => {});
        const errorBody = HttpErrorBodySchema.safeParse(detailsRaw);
        if (!errorBody.success) {
            return HttpError.unknown(response.status);
        }
        return new HttpError(
            response.status,
            errorBody.data.code,
            errorBody.data.message,
            errorBody.data.details
        );
    }

    public asResponse(): Response {
        const body: HttpErrorBody = {
            code: this.code,
            message: this.message,
            details: this.details
        };
        return new Response(
            JSON.stringify(body),
            {
                status: this.statusCode,
            },
        );
    }

    static notFound(resource: string, query: Record<string, unknown>): HttpError {
        return new HttpError(
            404,
            'not-found',
            `${resource} not found`,
            {
                resource,
                query,
            }
        );
    }

    static badRequestZod<T>(error: ZodError<T>): HttpError {
        return new HttpError(
            400,
            'bad-request-body',
            `${error.issues[0]?.code}`,
            {
                issues: error.issues.map(i => ({code: i.code, message: i.message, path: i.path}))
            }
        )
    }

    static fromResult(result: FailureResult<number>): HttpError {
        if (result.error instanceof HttpError) {
            return result.error;
        }
        return HttpError.unknown(500);
    }

    static conflict(code: string, message: string) {
        return new HttpError(
            409,
            'conflict',
            message,
            {
                code,
            }
        );
    }
}
