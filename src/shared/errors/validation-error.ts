import mongoose from 'mongoose';
import { IGenericErrorResponse } from '../types/common-type';
import { IGenericErrorMessage } from '../types/error-type';
 
/**
 * Handles Mongoose validation errors by transforming them into a standardized error response.
 * 
 * @param error - The Mongoose validation error to be processed
 * @returns A generic error response with status code, message, and detailed error messages
 */
const handleValidationError = (
  error: mongoose.Error.ValidationError
): IGenericErrorResponse => {
  const errors: IGenericErrorMessage[] = Object.values(error.errors).map(
    (el: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: el?.path,
        message: el?.message,
      };
    }
  );
  const statusCode = 400;
  return {
    statusCode,
    message: 'Validation Error',
    errorMessages: errors,
  };
};

export default handleValidationError;