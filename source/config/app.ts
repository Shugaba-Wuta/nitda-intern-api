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

const app = express()

//Top-level middlewares

app.use(helmet());
app.use(cors());
app.use(xss());
app.use(morgan("tiny"))
app.use(cors())
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET))

app.use(morgan("tiny"))





//Low-level middlewares
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)


const PORT = process.env.PORT || 5000
const startApp = async () => {
    console.log(`\nStarting app on port: ${PORT} .........................................`)
    app.listen(PORT, async () => {
        try {
            console.log("App is running: Press ctrl+x to stop app")

        } catch (err) {
            console.error("App could not start: \n", err)
        }

    })

}










export default startApp