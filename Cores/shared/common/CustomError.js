export default class CustomError extends Error {
    constructor(code, message, dev_message) {
      super(message);
      this.code = code;
  
      if (process.env.NODE_ENV !== 'production' && dev_message) {
        this.message = dev_message;
        console.error(this);
      }
    }
  
    get() {
      return {
        code: this.code,
        message: this.message
      };
    }
  }
  