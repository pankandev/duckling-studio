'use client'

import {z} from "zod";
import {err, ok, Result} from "@/lib/common/result";
import {HttpError} from "@/lib/common/http/http-error";

export interface ApiGetSettings<TBody> {
    url: string;
    queryParams?: Record<string, string | number>;
    responseSchema: z.Schema<TBody, z.ZodTypeDef, unknown>;
}

interface ApiWriteSettingsBase<TBody> {
    url: string;
    body: TBody;
}

export interface ApiWriteSettingsTyped<TBody, TResponse> extends ApiWriteSettingsBase<TBody> {
    responseSchema: z.Schema<TResponse>;
}

export interface ApiWriteSettingsUntyped<TBody> extends ApiWriteSettingsBase<TBody> {
    responseSchema?: undefined;
}

export type ApiWriteSettings<TBody, TResponse> = ApiWriteSettingsTyped<TBody, TResponse> | ApiWriteSettingsUntyped<TBody>;

/**
 * Parses a response from a JSON API and attempts to parse the response payload with the given Zod schema.
 * @param response The HTTP response.
 * @param schema The schema to parse the response payload.
 *
 * @returns A {@link Result} object with the parsed response, or a {@link HttpError}
 */
async function parseJsonResponse<T>(response: Response, schema: z.Schema<T, z.ZodTypeDef, unknown>): Promise<Result<T>> {
    // checks if response was successful
    if (!response.ok) {
        return err(await HttpError.fromResponse(response));
    }

    if (!schema) {
        return ok(await response.json()) as Result<T>;
    }
    const parsed = schema.safeParse(await response.json());
    if (!parsed.success) {
        return err(HttpError.badRequestZod(parsed.error));
    }
    return ok(parsed.data);
}


function buildUrlFromPath(path: string): URL {
    return new URL(window.location.protocol + '//' + window.location.host + path);
}

/**
 * Makes a GET HTTP request to the REST API.
 * @param settings The settings of the request.
 *
 * @returns A {@link Result} object with the parsed payload or an {@link HttpError}
 */
export async function apiGet<TResponse>(settings: ApiGetSettings<TResponse>): Promise<Result<TResponse>> {
    // build URL from base url and query params.
    const url = buildUrlFromPath(settings.url);
    const queryParams = settings.queryParams ?? {};
    for (const [key, value] of Object.entries(queryParams)) {
        url.searchParams.set(key, value.toString());
    }

    // make API call
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    return parseJsonResponse(response, settings.responseSchema);
}


/**
 * Makes an HTTP request to the REST API.
 * @param settings The settings of the request.
 * @param method The HTTP method of the request.
 * @param responseSchema The schema used to parse the response.
 *
 * @returns A {@link Result} object with the parsed payload or an {@link HttpError}
 */
async function fetchWrite<TBody, TResponse>(settings: ApiWriteSettingsBase<TBody>, method: string, responseSchema: z.Schema<TResponse>): Promise<Result<TResponse>> {
    const url = buildUrlFromPath(settings.url);
    const response = await fetch(url, {
        method: method,
        body: JSON.stringify(settings.body),
        headers: {
            "Content-Type": "application/json"
        }
    });

    return parseJsonResponse(response, responseSchema);
}


export async function apiPost<TBody, TResponse>(settings: ApiWriteSettingsTyped<TBody, TResponse>): Promise<Result<TResponse>>;
export async function apiPost<TBody>(settings: ApiWriteSettingsUntyped<TBody>): Promise<Result<unknown>>;


/**
 * Makes a POST HTTP request to the REST API.
 * @param settings The settings of the request.
 *
 * @returns A {@link Result} object with the parsed payload or an {@link HttpError}
 */
export function apiPost<TBody, TResponse>(settings: ApiWriteSettings<TBody, TResponse>): Promise<Result<TResponse | unknown>> {
    return fetchWrite(settings, 'POST', settings.responseSchema ?? z.unknown());
}

export async function apiPut<TBody, TResponse>(settings: ApiWriteSettingsTyped<TBody, TResponse>): Promise<Result<TResponse>>;
export async function apiPut<TBody>(settings: ApiWriteSettingsUntyped<TBody>): Promise<Result<unknown>>;

/**
 * Makes a PUT HTTP request to the REST API.
 * @param settings The settings of the request.
 *
 * @returns A {@link Result} object with the parsed payload or an {@link HttpError}
 */
export function apiPut<TBody, TResponse>(settings: ApiWriteSettings<TBody, TResponse>): Promise<Result<TResponse | unknown>> {
    return fetchWrite(settings, 'PUT', settings.responseSchema ?? z.unknown());
}

export async function apiDelete<TBody, TResponse>(settings: ApiWriteSettingsTyped<TBody, TResponse>): Promise<Result<TResponse>>;
export async function apiDelete<TBody>(settings: ApiWriteSettingsUntyped<TBody>): Promise<Result<unknown>>;

/**
 * Makes a DELETE HTTP request to the REST API.
 * @param settings The settings of the request.
 *
 * @returns A {@link Result} object with the parsed payload or an {@link HttpError}
 */
export function apiDelete<TBody, TResponse>(settings: ApiWriteSettings<TBody, TResponse>): Promise<Result<TResponse | unknown>> {
    return fetchWrite(settings, 'DELETE', settings.responseSchema ?? z.unknown());
}


export async function apiPatch<TBody, TResponse>(settings: ApiWriteSettingsTyped<TBody, TResponse>): Promise<Result<TResponse>>;
export async function apiPatch<TBody>(settings: ApiWriteSettingsUntyped<TBody>): Promise<Result<unknown>>;

/**
 * Makes a DELETE HTTP request to the REST API.
 * @param settings The settings of the request.
 *
 * @returns A {@link Result} object with the parsed payload or an {@link HttpError}
 */
export function apiPatch<TBody, TResponse>(settings: ApiWriteSettings<TBody, TResponse>): Promise<Result<TResponse | unknown>> {
    return fetchWrite(settings, 'PATCH', settings.responseSchema ?? z.unknown());
}
