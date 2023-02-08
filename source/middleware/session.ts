import { Response, Request, NextFunction } from "express"
import { Session } from "../models";



export const assignSession = async (req: Request, res: Response, next: NextFunction) => {
    const { body: user } = req || {}
    if (!user) {
        const session = await new Session({}).save()
        return res.json({ session })
    }


    return next
}