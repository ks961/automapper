export type Ctor<T> = new (...any: any) => T 

export type TransformerFn<T, R> = (obj: T) => R;

export type WithoutFunctionProps<T> = {
    [K in keyof T as T[K] extends Function ? never : K]: T[K];
};