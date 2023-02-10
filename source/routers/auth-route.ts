import { Router } from "express"
import { logout, login, refreshToken } from "../controllers/auth-controller"


const router = Router()
router.get("/logout", logout)
router.post("/login", login)
router.get("/refresh", refreshToken)

export default router