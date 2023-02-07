import { StatusCodes } from "http-status-codes/build/cjs/status-codes"

export class CustomAPIError extends Error {
    statusCode?: number
    constructor(message: string) {
        super(message)
        this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    }
}

