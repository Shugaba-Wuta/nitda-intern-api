import { Router } from "express";

import { getAUser, deactivateUser, updateAUser, createAUser, searchUser, uploadDocs, permanentlyDeleteUser, reactivateUser, downloadAcceptanceOrClearance, downloadDocs } from "../controllers/user-controller";

import guard_ from "express-jwt-permissions"
const guard = guard_()



const router = Router()


router.route("/")
    .post(
        guard.check([["admin"]]),
        createAUser)
    .get(guard.check([["user:read"], ["nysc:read", "siwes:read", "intern:read"], ["nysc:read", "siwes:read", "intern:read", "staff:read"], ["admin"]]),
        searchUser)

router.route("/:userID")
    .get(guard.check([["user:read"], ["nysc:read", "siwes:read", "intern:read"], ["nysc:read", "siwes:read", "intern:read", "staff:read"]]), getAUser)
    .patch(guard.check([["user:write"], ["admin"]]), updateAUser)
    .delete(guard.check([["user:write"], ["admin"]]), permanentlyDeleteUser)
router.post("/:userID/deactivate", [guard.check(["admin"])], deactivateUser)
router.post("/:userID/docs", [guard.check([["admin"], ["user:write"]])], uploadDocs)
router.post("/:userID/docs/:docID", [guard.check([["admin"], ["user:write"]])], downloadDocs)
router.post("/:userID/reactivate", [guard.check(["admin"])], reactivateUser)
router.post("/nysc/:userID/acceptance-clearance", [guard.check(["admin"])], downloadAcceptanceOrClearance)




export default router

