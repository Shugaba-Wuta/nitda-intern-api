import { CustomAPIError } from "./custom-api"
import { StatusCodes } from "http-status-codes"

export class UnauthorizedError extends CustomAPIError {
    constructor(message: string) {
        super(message)
        this.statusCode = StatusCodes.UNAUTHORIZED
    }
}
