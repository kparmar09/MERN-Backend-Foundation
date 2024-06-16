// Define an asyncHandler function that takes another function (fn) as an argument.
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    return await fn(req, res, next);
  } catch (err) {
    res.status(err.code || 500).json({
      success: false,
      message: err.message,
    });
  }
};

// Export the asyncHandler function to use it in other parts of the application.
export { asyncHandler };

/*
The same function can be written with Promise:-

const asyncHandler = (fn) => {
  // Return a new function that takes req, res, and next as arguments.
  (req, res, next) => {
    // Use Promise.resolve to handle the function execution and catch any errors.
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

*/
