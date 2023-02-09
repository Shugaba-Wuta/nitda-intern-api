import { Request } from "express";
import mongoose from "mongoose";




export interface IRequest extends Request {
    user?: {
        userID: string | mongoose.Types.ObjectId,
        role: string,
        permissions: string[],
        email: string
    }

}