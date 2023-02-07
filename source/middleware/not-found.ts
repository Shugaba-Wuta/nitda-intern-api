import { BadRequestError } from "../errors/bad-request"
import { NextFunction, Request, Response } from "express"
import url from "url"


export const notFound = async (req: Request, res: Response) => {
    throw new BadRequestError(`Route ${req.method} ${url.parse(req.url).pathname} does not exist`)
}