import { NextFunction, Response } from "express";
import { IRequest } from "request";
import { BadRequestError, UnauthenticatedError } from "../errors";
import { decodeToken } from "../utils/jwt";

export const retrieveAndValidateToken = async (req: IRequest, res: Response, refresh: boolean = false) => {
    const authHeader = req.headers.authorization
    var token
    if (authHeader) {
        token = authHeader.trim().split("Bearer ").filter(item => { return item.trim() !== "" })[0]
        if (!token) {
            throw new BadRequestError("Authentication failed: Bearer token is missing")
        }
    } else if (req.signedCookies.user) {
        token = req.signedCookies.user
    }
    if (!token) {
        throw new UnauthenticatedError("Unauthenticated: Login required")
    }
    const decodedToken = await decodeToken(token)
    return decodedToken
}
export const attachUserToRequest = async (req: IRequest, res: Response, next: NextFunction) => {
    const user = await retrieveAndValidateToken(req, res)
    req.user = user
    return next()
}

