import {AppError} from "@/services/error";

export type Result<T> =
    | { success: true; value: T }
    | { success: false; error: AppError }

// helper functions to create Results
export function ok<T>(value: T): Result<T>;
export function ok(): Result<void>;

export function ok<T>(value?: T): Result<T> {
    return {success: true, value: value as T};
}

export function err<T>(error: AppError): Result<T> {
    return {success: false, error};
}