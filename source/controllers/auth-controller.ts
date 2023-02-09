import { Response, NextFunction } from "express"
import { Session, Intern, Nysc, Siwes, Staff } from "../models";
import { IRequest } from "request";
import { BadRequestError, NotFoundError } from "../errors";
import { StatusCodes } from "http-status-codes";
import { createJWT } from "../utils/jwt";



export const login = async (req: IRequest, res: Response) => {
    const { email, password } = req.body
    if (!email) {
        throw new BadRequestError("login: email is required")
    }
    if (!password) {
        throw new BadRequestError("login: email is required")
    }
    let nysc, siwes, staff, intern
    nysc = await Nysc.findOne({ deleted: false, active: true, email })
    siwes = await Siwes.findOne({ deleted: false, active: true, email })
    staff = await Staff.findOne({ deleted: false, active: true, email })
    intern = await Intern.findOne({ deleted: false, active: true, email })

    var user
    if (staff && staff.comparePassword(password)) {
        var { _id: userID, role, permissions, } = staff
        user = staff
    } else if (nysc && nysc.comparePassword(password)) {
        var { _id: userID, role, permissions, } = nysc
        user = nysc
    } else if (siwes && siwes.comparePassword(password)) {
        var { _id: userID, role, permissions, } = siwes
        user = siwes
    } else if (intern && intern.comparePassword(password)) {
        var { _id: userID, role, permissions, } = intern
        user = intern
    } else {
        throw new NotFoundError("invalid email and password")
    }

    //Create new session
    await new Session({ user: userID, ip: req.ips || req.ip }).save()
    const payload = { userID, role, permissions, email }
    req.user = payload

    //setup cookies and tokens
    const cookie = createJWT(JSON.stringify(payload), "cookie")
    const accessToken = createJWT(JSON.stringify(payload), "token")

    req.cookies("user", cookie, )




    res.status(StatusCodes.OK).json({ message: "Login successful", result: user, success: true })


}