
export type Ctor<T> = new (...any: any) => T;

export type TransformerFn<T, R> = (obj: T) => R;

export type WithoutFunctionProps<T> = {
    [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

export const enum EmptyValidationError {
    EMPTY = "EMPTY"
}

export const enum TypeValidationError {
    INVALID_TYPE = "INVALID_TYPE"
}

export const enum LengthValidationError {
    LESS_THAN_MIN_LENGTH = "LESS_THAN_MIN_LENGTH",
    GREATER_THAN_MAX_LENGTH = "GREATER_THAN_MAX_LENGTH"
}

export const enum RegexValidationError {
    REGEX_VALIDATION_FAILED = "REGEX_VALIDATION_FAILED"
}

export type ValidationErrorReason =
  | EmptyValidationError
  | TypeValidationError
  | LengthValidationError
  | RegexValidationError;


export type ValidationInfo = {
    paramIndex: number,
    reason: ValidationErrorReason,
}


export type ErrorMsg = {
    errorMsg?: string
}

export type RequiredParamInfo = Record<number, string>;