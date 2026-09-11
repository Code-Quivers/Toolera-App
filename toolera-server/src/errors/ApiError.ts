class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string | undefined, stack = "") {
    super(message);
    this.statusCode = statusCode;

    if (stack) {
      this.stack = stack;
      return;
    }

    const capture = (Error as unknown as { captureStackTrace?: (target: object, ctor?: Function) => void }).captureStackTrace;
    if (typeof capture === "function") {
      capture(this, this.constructor);
    }
  }
}

export default ApiError;
