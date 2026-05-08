import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod/v3";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const zodError = error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        }));

        if (process.env.NODE_ENV == "PRODUCTION") {
          res.status(400).json({
            status: 400,
            message: `Invalid field`,
          });
        }

        res.status(400).json({
          status: 400,
          message: `Validation error`,
          error: zodError,
        });
      }
      next(error);
    }
  };
