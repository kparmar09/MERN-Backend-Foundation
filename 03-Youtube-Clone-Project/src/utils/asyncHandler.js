// Define an asyncHandler function that takes another function (fn) as an argument.
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    // Try to execute the passed-in function (fn) with req, res, and next.
    await fn(req, res, next);
  } catch (err) {
    // If an error occurs, catch it and respond with a status code and error message.
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
