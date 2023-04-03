export const USER_ROLES = ["Associate", "Department", "Admin", "HR"]
export const USER_SCHEMA = ["Nysc", "Siwes", "Intern", "Staff"]
export const INTERN_SCHEMA = USER_SCHEMA.filter(item => {
    item !== "Staff"
})

export const GENDERS = ["M", "F"]

export const QUALIFICATION = ["BSc.", "MSc.", "BEng.", "MEng.", "BA", "PhD.", "HND", "LLB"]

export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

export const INTERNSHIP_STATUS = ["Ongoing", "Done", "Aborted"]

export const COOKIE_DURATION = "12h"

export const TOKEN_DURATION = "10m"

export const USER_ROLE_LEVEL3 = ["Associate"]
export const USER_ROLE_LEVEL2 = ["Department"]
export const USER_ROLE_LEVEL1 = ["Admin", "HR"]
export const USER_ROLE_LEVEL0 = ["Admin"]
export const ASSOCIATE_SCHEMA = ["Nysc", "Siwes", "Intern"]
export const DEFAULT_PERMISSION = ["nysc:read", "siwes:read", "intern:read", "schedule:read"]
export const ELEVATED_STAFF_PERMISSION = [...DEFAULT_PERMISSION, "nysc:create", "nysc:delete", "nysc:update", "siwes:create", "siwes:delete", "siwes:update", "intern:create", "intern:update", "intern:delete", "user:read", "user:write"]
export const DEPARTMENT_EXCLUSIVE_PERMISSION = [...DEFAULT_PERMISSION, "schedule:create", "schedule:update", "schedule:delete", "staff:read"]
export const MAX_RESULT_LIMIT = 50
export const USER_SORT_OPTION = { firstName: 1, lastName: 1, createdAt: 1, updatedAt: 1, email: 1 }

export const IMMUTABLE_USER_FIELD = ["deleted", "deletedOn", "password", "role", "email", "active", "created", "updatedAt"]

export enum UserTypes {
    Nysc = "Nysc",
    Siwes = "Siwes",
    Intern = "Intern",
    Staff = "Staff"
}
