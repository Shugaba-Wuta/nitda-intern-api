import * as dotenv from 'dotenv'
dotenv.config()
import express from "express"
import morgan from "morgan"
import helmet from "helmet"
import cors from "cors"
import xss from "xss-clean"
import cookieParser from "cookie-parser"
const expressAsyncErrors = require("express-async-errors")






//Local imports
import { notFound as notFoundMiddleware } from "../middleware/not-found"
import { errorHandlerMiddleware } from '../middleware/error-handler'
import { connectDB } from '../db/connect'
import { attachUserToRequest } from '../middleware/auth'
import authRouter from "../routers/auth-route"

const app = express()
app.set("trust-proxy", 1)

//Top-level middlewares

app.use(helmet());
app.use(cors());
app.use(xss());
app.use(morgan("tiny"))
app.use(cors())
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET))

app.use(morgan("tiny"))
//Unauthenticated paths
app.use("/auth", authRouter)







//Low-level middlewares
app.use(notFoundMiddleware)
app.use(attachUserToRequest)
app.use(errorHandlerMiddleware)


const PORT = process.env.PORT || 5000
const ENV = process.env.ENV
const DB_URL = (ENV === "LIVE") ? process.env.DB_LIVE_URL : process.env.DEV_DB_URL

const startApp = async () => {
    try {
        await connectDB(DB_URL)
        app.listen(PORT, async () => {
            console.log(`Server is running on Port: ${PORT} ......................................`)
        })
    } catch (error) {
        console.log(error)
    }

}





export default startApp