import { WithoutFunctionProps } from "./types";

export class JsonObject<T> {

    fromJson(
        obj: WithoutFunctionProps<T>
    ): T {

        for(const key in obj) {
            if(
                !(key in this) ||
                obj[key] instanceof Function
            ) continue;

            (this as any)[key] = obj[key]
        }

        return this as unknown as T;
    }

    toJson(): WithoutFunctionProps<T> {
        const obj: WithoutFunctionProps<T> = {} as any;
        for(const key in this) {
            if(this[key] instanceof Function) continue;
            (obj as any)[key] = this[key];
        }

        return obj
    }
}