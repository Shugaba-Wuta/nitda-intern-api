import { Response } from "express"
import { Session, Intern, Nysc, Siwes, Staff, OTP } from "../models";
import { IRequest } from "request";
import { BadRequestError, NotFoundError, UnauthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";
import { createJWT } from "../utils/jwt";
import { Admin, COOKIE_DURATION, Department, HR } from "../config/data";
import { retrieveAndValidateToken } from "../middleware/auth"
import { getAnyUser } from "../utils/model-utils";
import ms from "ms"



export const login = async (req: IRequest, res: Response) => {
    const { email, password } = req.body
    if (!email) {
        throw new BadRequestError("login: email is required")
    }
    if (!password) {
        throw new BadRequestError("login: email is required")
    }
    const user = await getAnyUser(false, true, email, "")

    if (user && await user.comparePassword(password)) {
        var { _id: userID, role, permissions, } = user
    } else {
        throw new NotFoundError("invalid email and password")
    }

    //Create new session
    const userSchema = [Admin, HR, Department].includes(user.role) ? "Staff" : user.role
    const session = await new Session({ user: userID, ip: req.ips || req.ip, userSchema, userAgent: req.headers["user-agent"] }).save()
    const payload = { userID, role, permissions, email, sessionID: String(session._id) }

    //setup cookies and tokens
    const cookie = createJWT(payload, "cookie")
    const accessToken = createJWT(payload, "token")

    res.cookie("user", cookie, { maxAge: ms(COOKIE_DURATION), secure: process.env.ENV !== "dev" ? true : false, httpOnly: true, signed: true })

    res.status(StatusCodes.OK).json({ message: "Login successful", result: { accessToken }, success: true })


}
export const refreshToken = async (req: IRequest, res: Response) => {
    const payload = await retrieveAndValidateToken(req, res)
    //Delete existing time parameters from cookies.
    delete payload["iat"]
    delete payload["exp"]
    const refreshToken = createJWT(payload, "refresh")
    return res.status(StatusCodes.OK).json({ message: "refresh token", result: { refreshToken }, success: true })

}

export const logout = async (req: IRequest, res: Response) => {
    res.clearCookie("user")
    if (!req.user?.userID) {
        throw new UnauthenticatedError("User not logged in")
    }
    return res.status(StatusCodes.OK).json({ message: "logged out", result: null, success: true })
}

export const startResetPassword = async (req: IRequest, res: Response) => {
    let { email } = req.body || {}
    if (!email) {
        throw new UnauthenticatedError("email is missing from req.user")
    }
    const user = await getAnyUser(false, true, email, "")
    if (!user) {
        throw new BadRequestError("User does not exist")
    }
    const options = { sessionID: String(req.user?.sessionID), IPAddress: req.ip || req.ips, userAgent: req.headers["user-agent"] }
    await user.startPassResetFlow(options)
    res.status(StatusCodes.OK).json({ message: "Check email for OTP Code", success: true, result: null })
}
export const changePassword = async (req: IRequest, res: Response) => {
    const { OTPCode, email, tokenPurpose: purpose, oldPassword, newPassword } = req.body
    const user = await getAnyUser(false, true, email, "")
    let tokenValid = await OTP.verifyToken(OTPCode, purpose, email)
    if (oldPassword && user && await user.comparePassword(oldPassword)) {
        //First time login requires password change
        tokenValid = true
    }
    if (user && tokenValid) {
        user.password = newPassword
        await user.save()
        res.clearCookie("user")
        res.status(StatusCodes.OK).json({ message: "Password changed", success: true, result: null })
    }
    else {
        throw new BadRequestError("Unable to change password")
    }
}
