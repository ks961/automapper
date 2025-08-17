import { CustomFnParamInfo, RegExParamInfo, StringLengthParamInfo } from "./decorators";
import { ValidationInfo, RequiredParamInfo, EmptyValidationError, RegexValidationError, TypeValidationError, LengthValidationError } from "./types";
import { isEmpty } from "./utils";

export type RegexValidationInfo = {
    regex: RegExp
} & ValidationInfo;
export function validateRegexParams(
    paramIndexes: RegExParamInfo[],
    requiredParams: RequiredParamInfo,
    ...args: any
): RegexValidationInfo | undefined {
    if(!paramIndexes || paramIndexes?.length == 0) return;

    for(let idx = 0; idx < paramIndexes.length; idx++) {
        const { index, regex } = paramIndexes[idx];
        const value = args[index];

        if (
            isEmpty(value) &&
            (
                isEmpty(requiredParams) ||
                isEmpty(requiredParams[index]?.trim())
            )
        ) {
            continue;
        }

        if(isEmpty(value)) {
            return {
                regex,
                paramIndex: index,
                reason: EmptyValidationError.EMPTY
            };
        }
        
        if(!regex.test(value)) {
            return {
                regex,
                paramIndex: index,
                reason: RegexValidationError.REGEX_VALIDATION_FAILED
            }
        }
    }
}


export function validateStringLengthParams(
    paramIndexes: StringLengthParamInfo[],
    requiredParams: RequiredParamInfo,
    ...args: any
): ValidationInfo | undefined {
    if(!paramIndexes || paramIndexes?.length == 0) return;

    for(let idx = 0; idx < paramIndexes.length; idx++) {
        const { index, minLength, maxLength } = paramIndexes[idx];
        const value = args[index];
        
        if (
            isEmpty(value) &&
            (
                isEmpty(requiredParams) ||
                isEmpty(requiredParams[index]?.trim())
            )
        ) {
            continue;
        }
        
        if(isEmpty(value)) {
            return { reason: EmptyValidationError.EMPTY, paramIndex: index };
        }

        if(typeof value !== "string") {
            return { reason: TypeValidationError.INVALID_TYPE, paramIndex: index };
        }
        
        if(value.length < minLength) {
            return { reason: LengthValidationError.LESS_THAN_MIN_LENGTH, paramIndex: index };
        }
        
        if(maxLength && value.length > maxLength) {
            return { reason: LengthValidationError.GREATER_THAN_MAX_LENGTH, paramIndex: index };
        }
    }
}

export function validateCustomFnParams(
    paramIndexes: CustomFnParamInfo[],
    paramsInfo: Record<string, unknown>,
    requiredParams: RequiredParamInfo,
    ...args: any
) {
    if(!paramIndexes || paramIndexes?.length == 0) return;

    for(let idx = 0; idx < paramIndexes.length; idx++) {
        const { index, fn, errorMsg } = paramIndexes[idx];
        const value = args[index];

        if (
            isEmpty(value) &&
            (
                isEmpty(requiredParams) ||
                isEmpty(requiredParams[index]?.trim())
            )
        ) {
            continue;
        }

        const state = fn(value, paramsInfo);

        if(typeof state === "string") {
            return {
                reason: state,
                paramIndex: index,
            }
        } else if(typeof state === "boolean" && !state) {
            return {
                reason: errorMsg,
                paramIndex: index,
            }
        }
    }

}