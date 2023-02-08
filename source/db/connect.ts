import mongoose from "mongoose";
import { CustomAPIError } from "../errors";




mongoose.set("strictQuery", true)


export const connectDB = (DB_URL: string | undefined) => {
    if (!DB_URL) {
        throw new CustomAPIError("DB URL cannot be undefined or null")
    }; console.log(DB_URL)
    return mongoose.connect(DB_URL)


}
