class CustomError extends Error {
  status: number;
  err: any;
  constructor(message: string) {
    super(message);
    this.name = "CustomError";
    this.status = -1;
    this.err = message;
  }
}

class UnauthorizedError extends Error {
  status: number;
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
    this.status = 401;
  }
}
class ValidateParamsError extends Error {
  status: number;
  error: any;
  constructor(message: string, error: any) {
    super(message);
    this.name = "参数校验失败";
    this.status = 400;
    this.error = error;
  }
}

class ForbiddenError extends Error {
  status: number;
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
    this.status = 403;
  }
}

class ManyRequestError extends Error {
  status: number;
  constructor(message: string) {
    super(message);
    this.name = "ManyRequestError";
    this.status = 429;
  }
}
class FireError extends Error {
  status: number;
  constructor(message: string) {
    super(message);
    this.name = "FireError";
    this.status = 500;
  }
}
export {
  CustomError,
  UnauthorizedError,
  ForbiddenError,
  ManyRequestError,
  FireError,
  ValidateParamsError,
};
