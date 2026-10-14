import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Wraps an asynchronous route handler/controller function.
 * Automatically catches any rejected promise or thrown error and forwards it to next(err),
 * seamlessly delegating to the centralized errorHandler middleware without boilerplated try/catch.
 *
 * Example:
 * router.get('/items', asyncHandler(controller.list));
 */
export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default asyncHandler;
