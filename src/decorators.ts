import { ValidationFailedError } from "./error-classes";
import { validateCustomFnParams, validateRegexParams, validateStringLengthParams } from "./validators";
import { Ctor, EmptyValidationError, ErrorMsg, LengthValidationError, RegexValidationError, RequiredParamInfo, TypeValidationError, WithoutFunctionProps } from "./types";
import { isEmpty, regexEqual } from "./utils";
import { JsonObject } from "./json-object";

const REGEX_PARAMS         = Symbol("REGEX_PARAMS");
const REQUIRED_PARAMS      = Symbol("REQUIRED_PARAMS");
const CUSTOM_FN_PARAMS     = Symbol("CUSTOM_FN_PARAMS");
const STRING_LENGTH_PARAMS = Symbol("STRING_LENGTH_PARAMS");

export function Required(
    errorMsg: string = "This parameter is required."
) {

    return function(
        target: any,
        _propertyKey: string | undefined, 
        index: number,
    ) {
        if(!((target as any)[REQUIRED_PARAMS])) {
            (target as any)[REQUIRED_PARAMS] = {};
        }

        (target as any)[REQUIRED_PARAMS][index] = errorMsg;
    }

}

export type RegExParamInfo = {
    index: number, 
    regex: RegExp
} & ErrorMsg;
export function Regex(
    regex: RegExp,
    errorMsg?: string
) {
    return function(
        target: any,
        _propertyKey?: string | undefined, 
        index?: number
    ) {

        const arr: RegExParamInfo[] = (target as any)[REGEX_PARAMS] || [];
        (target as any)[REGEX_PARAMS] = [...arr, { index, regex, errorMsg }];
    }
}

export type StringLengthParamError = {
    minLength?: string,
    maxLength?: string
}
export type StringLengthParamInfo = {
    index: number,
    minLength: number,
    maxLength?: number
    errorMsg?: StringLengthParamError
};

export function StringLength(
    minLength: number,
    maxLength?: number,
    errorMsg?: StringLengthParamError
) {
    if(
        minLength < 0 ||
        maxLength && maxLength < 0
    ) {
        throw new Error("Any of length value cannot be a negative value.")
    }
        
    if(
        maxLength && maxLength < minLength
    ) {
        throw new Error("Maximum length cannot be less than Minimum length.")
    }

    return function(
        target: any,
        _propertyKey?: string | undefined, 
        index?: number
    ) {

        const arr: StringLengthParamInfo[] = (target as any)[STRING_LENGTH_PARAMS] || [];
        (target as any)[STRING_LENGTH_PARAMS] = [...arr, { index, minLength, maxLength, errorMsg }];
    }
}

export function Email(
    errorMsg: string = "Email address is invalid."
) {
    return function(
        target: any,
        _propertyKey?: string | undefined, 
        index?: number
    ) {

        const arr: RegExParamInfo[] = (target as any)[REGEX_PARAMS] || [];

        const regex = new RegExp("(?=^[a-zA-Z]+)[a-zA-Z\%\-\_\.\+0-9]+@[a-zA-Z\-]+\.[a-zA-Z]{2,}$");

        (target as any)[REGEX_PARAMS] = [...arr, { index, regex, errorMsg }];
    }
}

export function Password(
    errorMsg: string = "Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long."
) {
    return function(
        target: any,
        _propertyKey?: string | undefined, 
        index?: number
    ) {

        const arr: RegExParamInfo[] = (target as any)[REGEX_PARAMS] || [];
        
        const regex = new RegExp("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$");

        (target as any)[REGEX_PARAMS] = [...arr, { index, regex, errorMsg }];
    }
}

export type ErrorString = string;
export type CustomFn<T = unknown> = 
    (value: T, body?: unknown) => (boolean | ErrorString);

export type CustomFnParamInfo = {
    index: number,
    fn: CustomFn,
    errorMsg: ErrorString
}
export function CustomFn(
    fn: CustomFn,
    errorMsg = "Custom Function evaluation failed"
) {
    return function(
        target: any,
        _propertyKey: string | undefined,
        index?: number
    ) {
        const arr: CustomFnParamInfo[] = (target as any)[CUSTOM_FN_PARAMS] || [];

        (target as any)[CUSTOM_FN_PARAMS] = [...arr, { index, fn, errorMsg }];
    }
}

export function DTO<T extends Ctor<{}>>(
    constructor: T
) {
    
    return class extends constructor {
        public __params__!: string[];
        public __requiredParams__!: RequiredParamInfo;

        constructor(...args: any[]) {

            super(...args);
            
            const paramMatch = constructor.toString().match(/constructor\s*\(([^)]*)\)/)?.[1];
            if (!paramMatch) return;

            this.__params__ = paramMatch.split(",").map(p => p.trim()).filter(Boolean) || [];
            if (this.__params__.length === 0) return;

            this.__requiredParams__ = (constructor as any)[REQUIRED_PARAMS] as RequiredParamInfo || {};

            this.__handleRegexValidation__(
                ...args,
            )

            this.__handleStringValidation__(
                ...args,
            );

            this.__handleCustomFnValidation__(
                ...args
            );
        }

        __handleStringValidation__(
            ...args: any
        ) {
            const stringLengthParams = (constructor as any)[STRING_LENGTH_PARAMS] as StringLengthParamInfo[];
            
            const validationInfo = validateStringLengthParams(
                stringLengthParams, 
                this.__requiredParams__,
                ...args
            );

            if(validationInfo) {
                const field = this.__params__[validationInfo.paramIndex];
                const paramInfo = stringLengthParams[validationInfo.paramIndex];

                switch(validationInfo.reason) {
                    case EmptyValidationError.EMPTY:
                        throw new ValidationFailedError(
                            field,
                            `Parameter '${field}' is required and cannot be empty.`
                        );
                    case TypeValidationError.INVALID_TYPE:
                        throw new ValidationFailedError(
                            field,
                            `Parameter '${field}' is not a string.`
                        );
                    case LengthValidationError.LESS_THAN_MIN_LENGTH:
                        throw new ValidationFailedError(
                            field, 
                            paramInfo?.errorMsg?.minLength ||
                            `Parameter '${field}' length is less than minimum required length.`
                        );
                    case LengthValidationError.GREATER_THAN_MAX_LENGTH:
                        throw new ValidationFailedError(
                            field, 
                            paramInfo?.errorMsg?.maxLength ||
                            `Parameter '${field}' length is greater than maximum required length.`
                        );
                    default:
                        throw new Error("Should be unreachable in 'validateStringLengthParams'");
                }
            }
        }

        __handleRegexValidation__(
            ...args: any
        ) {
            const regexParams = (constructor as any)[REGEX_PARAMS] as RegExParamInfo[];
            const regexValidationInfo = validateRegexParams(
                regexParams, 
                this.__requiredParams__, 
                ...args
            );

            if(regexValidationInfo) {
                const field = this.__params__[regexValidationInfo.paramIndex];

                const paramInfoIdx = regexParams.findIndex(
                    param => param.index === regexValidationInfo.paramIndex && 
                    regexEqual(param.regex, regexValidationInfo.regex)
                );

                if(paramInfoIdx === -1) {
                    throw new Error(
                        `Regex validation failed: no matching parameter found for index '${regexValidationInfo.paramIndex}' with pattern '${regexValidationInfo.regex}'`
                    );
                }

                const paramInfo = regexParams[paramInfoIdx];

                switch(regexValidationInfo.reason) {
                    case EmptyValidationError.EMPTY:
                        throw new ValidationFailedError(
                            field,
                            `Parameter '${field}' is required and cannot be empty.`
                        );
                    case RegexValidationError.REGEX_VALIDATION_FAILED:
                        throw new ValidationFailedError(
                            field, 
                            paramInfo?.errorMsg || 
                            `Parameter '${field}' does not match the regex pattern.`
                        );
                    default:
                        throw new Error("Should be unreachable 'validateRegexParams'.");
                }
                
            }
        }

        __handleCustomFnValidation__(
            ...args: any
        ) {
            const customFnParams = (constructor as any)[CUSTOM_FN_PARAMS] as CustomFnParamInfo[];

            const paramsInfo = args.reduce((acc: Record<string, unknown>, value: unknown, idx: number) => {
                const param = this.__params__[idx];
                acc[param] = value;
                return acc;
            }, {} as Record<string, unknown>);

            const customFnValidationInfo = validateCustomFnParams(
                customFnParams,
                paramsInfo,
                this.__requiredParams__,
                ...args
            );

            if(customFnValidationInfo) {
                const field = this.__params__[customFnValidationInfo.paramIndex];
                throw new ValidationFailedError(
                    field,
                    `Parameter '${field}': ${customFnValidationInfo.reason}`
                )
            }
        }
    };
}