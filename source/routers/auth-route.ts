import { Router } from "express"
import { logout, login, refreshToken, changePassword, startResetPassword } from "../controllers/auth-controller"


const router = Router()
router.get("/logout", logout)
router.post("/login", login)
router.get("/refresh", refreshToken)
router.post("/change-password", changePassword)
router.post("/start-change-password", startResetPassword)
export default router