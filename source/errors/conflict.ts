import { CustomAPIError } from "./custom-api"
import { StatusCodes } from "http-status-codes"

export class ConflictRecordError extends CustomAPIError {
    constructor(message: string) {
        super(message)
        this.statusCode = StatusCodes.CONFLICT
    }
}
