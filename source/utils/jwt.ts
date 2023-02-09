import jwt from "jsonwebtoken"
import { IRequest } from "request"


export const createJWT = (payload: string, type: string = "token") => {
    const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET || "secret"
    if (type === "token") {
        return jwt.sign(payload, JWT_TOKEN_SECRET, { expiresIn: "10m" })
    } else if (type === "cookie") {
        return jwt.sign(payload, JWT_TOKEN_SECRET, { expiresIn: "12h" })
    } else if (type === "refresh") {
        return jwt.sign(payload, JWT_TOKEN_SECRET, { expiresIn: "10m" })
    } else {
        throw new Error(`token: invalid type ${type}`)
    }
}

export const isTokenValid = (token: string) => {
    const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET || "secret"
    return jwt.verify(token, JWT_TOKEN_SECRET, (error, decode) => {
        if (error) return false
        return true
    })
}

