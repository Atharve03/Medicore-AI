/**
 * Wraps an async Express route/controller handler so any rejected promise
 * is forwarded to next(err) instead of crashing the process or requiring
 * a try/catch in every controller.
 *
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<any>} fn
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
