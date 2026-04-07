import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod/v3";
import { BadRequestException } from "~/shared/utils/error-exception";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.log(error)
        const errorMessages = error.errors.map((err) => err.message).join(", ");
        throw new BadRequestException(errorMessages);
      }
      next(error);
    }
  };
