export type FormErrors = Record<string, string[] | undefined>;

export const errorResponse = (
    message: string,
    statusCode: number,
    error?: FormErrors
) => {
    return {
        success: false,
        statusCode,
        message,
        error
    };
};