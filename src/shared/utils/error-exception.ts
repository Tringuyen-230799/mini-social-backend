import { StatusCodes } from "http-status-codes";

export class ErrorException extends Error {
  statusCode: number;
  error: unknown;
  subCode?: number;
  constructor(message: string, statusCode: number, error?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
  }
}

export class BadRequestException extends ErrorException {
  constructor(message: string, error?: unknown) {
    super(message, StatusCodes.BAD_REQUEST, error);
  }
}

export class UnauthorizedException extends ErrorException {
  constructor(message: string, subCode?: number) {
    super(message, StatusCodes.UNAUTHORIZED, "Unauthorized");
    this.subCode = subCode;
  }
}

export class ForbiddenException extends ErrorException {
  constructor(message: string) {
    super(message, StatusCodes.FORBIDDEN, "Forbidden");
  }
}

export class NotFoundException extends ErrorException {
  constructor(message: string) {
    super(message, StatusCodes.NOT_FOUND, "Not Found");
  }
}

export class ConflictException extends ErrorException {
  constructor(message: string) {
    super(message, StatusCodes.CONFLICT, "Conflict");
  }
}

export class InternalException extends ErrorException {
  constructor(message: string) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error");
  }
}

export class TooManyRequestException extends ErrorException {
  constructor(message: string) {
    super(message, StatusCodes.TOO_MANY_REQUESTS, "Too Many Request");
  }
}

export class RequestTimeoutException extends ErrorException {
  constructor(message: string) {
    super(message, StatusCodes.REQUEST_TIMEOUT, "Request Timeout");
  }
}

export class BadRequestExceptionWithSubCode extends ErrorException {
  constructor(message: string, subCode: number) {
    super(message, StatusCodes.BAD_REQUEST, "Bad Request");
    this.subCode = subCode;
  }
}
