import { Router } from "express";

import { getAUser, deleteAUser, updateAUser, createAUser, searchUser } from "../controllers/user-controller";

import guard_ from "express-jwt-permissions"
const guard = guard_()



const router = Router()


router.route("/")
    .post(guard.check([["user:write"]]), createAUser)
    .get(guard.check([["user:read"], ["nysc:read", "siwes:read", "intern:read"], ["nysc:read", "siwes:read", "intern:read", "staff:read"]]),
        searchUser)

router.route("/:userID")
    .get(guard.check([["user:read"], ["nysc:read", "siwes:read", "intern:read"], ["nysc:read", "siwes:read", "intern:read", "staff:read"]]), getAUser)
    .patch(guard.check([["user:write"]]), updateAUser)
    .delete(guard.check(["user:write"]), deleteAUser)




export default router

