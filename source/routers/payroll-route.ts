import { Router } from "express"
import guard_ from "express-jwt-permissions"

import { getAllPaymentInfo, addInternsToPayRoll } from "../controllers/payroll-controller"
const guard = guard_()

const router = Router()

router.route("/").get(guard.check(["admin"]), getAllPaymentInfo).post(guard.check(["admin"]), addInternsToPayRoll)



export default router