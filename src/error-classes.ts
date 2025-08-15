

export class ValidationFailedError extends Error {
    public field: string;
    constructor(
        field: string,
        message: string
    ) {
        super(message);
        this.field = field;
    }
}