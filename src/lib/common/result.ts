interface ResultBase<T> {
    map<U>(fn: (v: T) => U): Result<U>;
}

export class SuccessResult<T> implements ResultBase<T> {
    success = true as const;

    constructor(
        public readonly value: T,
    ) {
    }

    map<U>(fn: (v: T) => U): SuccessResult<U> {
        return new SuccessResult(fn(this.value));
    }
}

export class FailureResult<T> implements ResultBase<T> {
    success = false as const;
    value = undefined;

    constructor(
        public readonly error: Error,
    ) {
    }

    map<U>(): Result<U> {
        return this;
    }
}

export type Result<T> = SuccessResult<T> | FailureResult<T>;

// helper functions to create Results
export function ok<T>(value: T): SuccessResult<T>;
export function ok(): SuccessResult<void>;

export function ok<T>(value?: T): SuccessResult<T> {
    return new SuccessResult(value as T);
}

export function err<T>(error: Error): FailureResult<T> {
    return new FailureResult(error);
}
