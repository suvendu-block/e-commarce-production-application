// 404 catch-all — any URL that didn't match a route lands here
const notFound = (req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Central error handler — normalizes Mongoose/JWT errors into JSON responses
// Stack trace shown only in development
const errorHandler = (err, req, res, next) => {
    let statusCode = err.status || err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
    let message = err.message;

    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found';
    }

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(e => e.message).join(', ');
    }

    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue).join(', ');
        message = `Duplicate value for ${field}`;
    }

    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export { notFound, errorHandler };
