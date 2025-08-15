
export const isEmpty = (value: any) => 
    value === null || 
    value === undefined ||  
    (typeof value === 'string' && value.trim() === '');

export function regexEqual(lhs: RegExp, rhs: RegExp) {
    return lhs.source === rhs.source && lhs.flags === rhs.flags;
}