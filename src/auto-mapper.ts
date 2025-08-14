import { Ctor } from "./types";
import { Mapper } from "./mapper";

export class AutoMapper {

    map<S, D>(
        src: Ctor<S>,
        dest: Ctor<D>
    ) {
        return new Mapper(src, dest);
    }

    partialConstructor<C extends new (...any: any) => any>(
        ctor: C,
        optionalArgs?: Record<keyof C, boolean>
    ): new (...args: Partial<ConstructorParameters<C>>) => InstanceType<C> {
        return class extends (ctor as any) {
            constructor(...args: any[]) {
                const updatedArgs = args.map((arg, index) => 
                    (optionalArgs as any)?.[index] ? undefined : arg
                );
                super(...updatedArgs);
            }
        } as unknown as new (...args: Partial<ConstructorParameters<C>>) => InstanceType<C>;
    }
}