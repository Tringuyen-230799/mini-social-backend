import { Request, Response, NextFunction } from 'express';
import { ErrorException } from './error-exception';

function errorConvert(error: any) {
  const stackTrace = error.stack || '';
  const stackLines = stackTrace.split('\n');

  let fileError = null;
  let lineError = null;
  let columnError = null;

  const stackRegex = /\((.*?):(\d+):(\d+)\)/;
  for (const line of stackLines) {
    const match = stackRegex.exec(line);
    if (match) {
      fileError = match[1];
      lineError = match[2];
      columnError = match[3];
      break;
    }
  }
  return `${error.name}: ${error.message} at ${fileError}:${lineError}:${columnError}`;
}

export const wrapper = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await fn(req, res, next);
      if (!res.headersSent) {
        res.status(200).json({ status: 200, message: 'Success', data: response });
      }
    } catch (error) {
      if (!res.headersSent) {
        const status = error instanceof ErrorException ? error.statusCode : 500;
        const message = error instanceof ErrorException ? error.message : 'Internal Server Error';
        res.status(status).json({ status: status, message: message, error: errorConvert(error) });
      }
    }
  };
};
