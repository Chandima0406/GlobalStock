/**
 * Async handler middleware to handle async/await errors
 * Wraps async functions to catch errors and pass them to Express error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;