import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware to validate request body, params, and query against a Zod schema
 */
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Create validation data object with body, params, and query
      const validationData = {
        body: req.body,
        params: req.params,
        query: req.query,
      };

      // Parse the data with the schema
      schema.parse(validationData);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Validation failed',
      });
      return;
    }
  };
};
