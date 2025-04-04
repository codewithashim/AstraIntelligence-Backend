import { ZodError, ZodIssue } from 'zod';
import { IGenericErrorResponse } from '../types/common-type';
import { IGenericErrorMessage } from '../types/error-type';

/**
 * Handles Zod validation errors by transforming them into a standardized error response.
 * 
 * @param error - The ZodError containing validation issues
 * @returns A generic error response with status code, message, and detailed error messages
 */
const handleZodError = (error: ZodError): IGenericErrorResponse => {
    const errors: IGenericErrorMessage[] = error.issues.map(
        (issue: ZodIssue) => {
            return {
                path: issue?.path[issue.path.length - 1],
                message: issue?.message,
            };
        },
    );

    const statusCode = 400;

    return {
        statusCode,
        message: 'Validation Error',
        errorMessages: errors,
    };
};

export default handleZodError;
