import { NextFunction, Response } from "express";
import { IRequest } from "request";
import { BadRequestError, UnauthenticatedError } from "../errors";
import { decodeToken } from "../utils/jwt";


export const attachUserToRequest = async (req: IRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    var token
    if (authHeader) {
        token = authHeader.trim().split("Bearer ").filter(item => { return item.trim() !== "" })[0]
        if (!token) {
            throw new BadRequestError("Authentication failed: Bearer token is missing")
        }
    }
    token = req.signedCookies.user
    if (!token) {
        throw new UnauthenticatedError("Unauthenticated: Login required")
    }
    const decodedToken = await decodeToken(token)
    req.user = decodedToken
    return next()
}

