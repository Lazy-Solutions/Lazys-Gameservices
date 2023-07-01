export default class CustomError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }

    get() {
        return {
            code: this.code,
            message: this.message,
        };
    }
}
