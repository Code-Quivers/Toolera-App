import { IGenericErrorMessage } from "../interfaces/error";

const handleClientError = (error: any) => {
  if (error.code === "23505") {
    return {
      statusCode: 400,
      message: "Duplicate value violation",
      errorMessages: [
        {
          path: error.constraint,
          message: error.detail || "Unique constraint violation",
        },
      ],
    };
  }

  if (error.code === "23502") {
    return {
      statusCode: 400,
      message: "Missing required field",
      errorMessages: [
        {
          path: "",
          message: error.detail,
        },
      ],
    };
  }

  return {
    statusCode: 500,
    message: "Database error",
    errorMessages: [
      {
        path: "",
        message: error.message,
      },
    ],
  };
};

export default handleClientError;
