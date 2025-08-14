import { Ctor, TransformerFn, WithoutFunctionProps } from "./types";


export class Mapper<S, D> {

    private memberMap = new Map<keyof D, TransformerFn<S, D[keyof D]>>();

    constructor(
        private src: Ctor<S>,
        private dest: Ctor<D>
    ) {}

    forMember(
        member: keyof WithoutFunctionProps<D>,
        transformer: TransformerFn<S, D[keyof D]>
    ) {
        this.memberMap.set(member, transformer);
        return this;
    }


    map(
        obj: S
    ): D {
        const dto = new this.dest();

        for(const key in dto) {
            if(
                (obj as any)[key] instanceof Function ||
                (this.src as any)[key] instanceof Function ||
                (this.dest as any)[key] instanceof Function
            ) continue;

            
            if(this.memberMap.has(key)) {
                const transformer = this.memberMap.get(key)!;
                (dto as any)[key] = transformer(obj)
            } else if(key in (obj as any) && key in (dto as any)) {
                (dto as any)[key] = (obj as any)[key];
            }
        }

        return dto;
    }
}