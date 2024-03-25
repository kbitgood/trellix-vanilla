export abstract class HTTPError extends Error {
  abstract status: number;
  abstract statusText: string;
}
export class BadRequestError extends HTTPError {
  status = 400;
  statusText = "Bad Request";
  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedError extends HTTPError {
  status = 401;
  statusText = "Unauthorized";
  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends HTTPError {
  status = 404;
  statusText = "Not Found";
  constructor(message: string) {
    super(message);
  }
}
