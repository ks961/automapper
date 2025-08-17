
export const isEmpty = (value: any) => 
    value === null || 
    value === undefined ||  
    (typeof value === 'string' && value.trim() === '');

export function regexEqual(lhs: RegExp, rhs: RegExp) {
    return lhs.source === rhs.source && lhs.flags === rhs.flags;
}

type GroupByCallback<T, K extends string | number | symbol> = (item: T, index: number) => K;

export function groupBy<T, K extends string | number | symbol>(
  arr: T[],
  callback: GroupByCallback<T, K>
): Record<K, T[]> {
    
    if (typeof (Object as any).groupBy === 'function') {
        return (Object as any).groupBy(arr, callback);
    }

    return arr.reduce((acc: Record<K, T[]>, cur, i) => {
        const key = callback(cur, i);
        if (!acc[key]) acc[key] = [];
        acc[key].push(cur);
        return acc;
    }, {} as Record<K, T[]>);
}