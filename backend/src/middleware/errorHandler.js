const errorHandler = (err, _req, res, _next) => {

    console.error(`[ERROR] ${err.message}`);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        error: err.message || 'Something went wrong',
        statusCode
    });
};

export const createError = (statusCode, message) => {

    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
};

export default errorHandler;