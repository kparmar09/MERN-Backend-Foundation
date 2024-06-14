// Define a class ApiResponse to standardize API responses.
class ApiResponse {
  // Constructor for ApiResponse that takes statusCode, data, and message as arguments.
  constructor(statusCode, data, message = "Success") {
    // Set the statusCode property to the provided statusCode.
    this.statusCode = statusCode;
    // Set the data property to the provided data.
    this.data = data;
    // Set the message property to the provided message, defaulting to "Success".
    this.message = message;
    // Determine success based on the statusCode. If statusCode is less than 400, success is true.
    this.success = statusCode < 400;
  }
}

// Example usage:
// const response = new ApiResponse(200, { id: 1, name: "John Doe" }, "Data retrieved successfully");

export { ApiResponse };
