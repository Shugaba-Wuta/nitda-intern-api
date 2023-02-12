const { StatusCodes } = require('http-status-codes');
import { NextFunction, Request, Response, } from "express"


export const errorHandlerMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    let customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || 'Something went wrong try again later',
    };
    if (err.name === 'ValidationError') {
        customError.msg = Object.values(err.errors)
            .map((item) => {
                if (item instanceof Error)
                    item.message
            }
            )
            .join(',');

        customError.statusCode = StatusCodes.BAD_REQUEST;
    }
    if (err.code && err.code === 11000) {
        customError.msg = `Duplicate value entered for ${Object.keys(
            err.keyValue
        )} field, please choose another value`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }
    if (err.name === 'CastError') {
        customError.msg = `Invalid id: '${err.value}' provided`;
        customError.statusCode = StatusCodes.NOT_FOUND;
    }
    if (err.code === "permission_denied") {
        customError.msg = `Unauthorized access to this route ${req.url}.`
        customError.statusCode = StatusCodes.FORBIDDEN
    }
    console.log(err)
    return res.status(customError.statusCode).json({
        success: false,
        error: true,
        message: customError.msg,
    });

};