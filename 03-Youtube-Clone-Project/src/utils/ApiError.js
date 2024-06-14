// Define a custom error class ApiError that extends the built-in Error class.
class ApiError extends Error {
  // Constructor for ApiError that takes statusCode, message, errors, and stack as arguments.
  constructor(
    statusCode, // The HTTP status code for the error.
    message = "Something went wrong", // The error message, defaulting to "Something went wrong".
    errors = [], // Additional errors, defaulting to an empty array.
    stack = "" // The stack trace, defaulting to an empty string.
  ) {
    // Call the parent class (Error) constructor with the message.
    super(message);
    // Set the statusCode property to the provided statusCode.
    this.statusCode = statusCode;
    // Initialize the data property to null.
    this.data = null;
    // Set the message property to the provided message.
    this.message = message;
    // Set the success property to false.
    this.success = false;
    // Set the errors property to the provided errors.
    this.errors = errors;

    // If a stack trace is provided, set the stack property to the provided stack trace.
    if (stack) {
      this.stack = stack;
    } else {
      // Otherwise, capture the current stack trace and set it to the stack property.
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Export the ApiError class to use it in other parts of the application.
export { ApiError };

// Example Usage:
// throw new ApiError(404, `User with ID ${userId} not found`);

// Documentation:-
// https://nodejs.org/api/errors.html#class-error
