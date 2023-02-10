import jwt, { decode } from "jsonwebtoken"
import { token } from "morgan"
import { cookieDuration, tokenDuration } from "../config/data"
import { BadRequestError } from "../errors"



export const createJWT = (payload: string, type: string = "token") => {
    const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET
    if (!JWT_TOKEN_SECRET) {
        throw new Error("variable: JWT_TOKEN_SECRET is missing")
    }
    if (type === "token") {
        return jwt.sign(payload, JWT_TOKEN_SECRET, { expiresIn: tokenDuration })
    } else if (type === "cookie") {
        return jwt.sign(payload, JWT_TOKEN_SECRET, { expiresIn: cookieDuration })
    } else if (type === "refresh") {
        return jwt.sign(payload, JWT_TOKEN_SECRET, { expiresIn: tokenDuration })
    } else {
        throw new Error(`token: invalid type ${type}`)
    }
}

export const isTokenValid = (token: string) => {
    const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET
    if (!JWT_TOKEN_SECRET) {
        throw new Error("variable: JWT_TOKEN_SECRET is missing")
    }
    return jwt.verify(token, JWT_TOKEN_SECRET, (error, decode) => {
        if (error) return false
        return true
    })
}

export const decodeToken = async (token: string) => {
    const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET
    if (!JWT_TOKEN_SECRET) {
        throw new Error("variable: JWT_TOKEN_SECRET is missing")
    }
    const decoded = jwt.verify(token, JWT_TOKEN_SECRET)
    if (decoded) {
        return JSON.parse(String(decoded))
    }
    throw new BadRequestError("Authentication failed: invalid token")
}


