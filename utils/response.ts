


export const response = (success: boolean, message: string, data: any, statusCode: number = 200, meta?: any) => {
    return {
        success,
        statusCode,
        message,
        data,
        meta
    };
};

