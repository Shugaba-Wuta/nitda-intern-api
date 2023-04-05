export const USER_ROLES = ["Associate", "Department", "Admin", "HR"]
export const USER_SCHEMA = ["Nysc", "Siwes", "Intern", "Staff"]
export const INTERN_SCHEMA = USER_SCHEMA.filter(item => {
    return item !== "Staff"
})

export const GENDERS = ["M", "F"]

export const QUALIFICATION = ["BSc.", "MSc.", "BEng.", "MEng.", "BA", "PhD.", "HND", "LLB"]

export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

export const INTERNSHIP_STATUS = ["Ongoing", "Done", "Aborted"]

export const COOKIE_DURATION = "12h"

export const TOKEN_DURATION = "10m"

export const HR = "HR"
export const Admin = "Admin"
export const Nysc = "Nysc"
export const Department = "Department"
export const Siwes = "Siwes"
export const Intern = "Intern"



// export const USER_ROLE_LEVEL3 = ["Associate"]
export const USER_ROLE_LEVEL3 = [Department, Admin, HR, Nysc, Siwes, Intern]
export const USER_ROLE_LEVEL2 = [Department, Admin, HR]
export const USER_ROLE_LEVEL1 = [Admin, HR]
export const USER_ROLE_LEVEL0 = [Admin]
export const ASSOCIATE_SCHEMA = [Nysc, Siwes, Intern]
//Permissions
export const DEFAULT_PERMISSION = ["nysc:read", "siwes:read", "intern:read", "schedule:read"]
export const ELEVATED_STAFF_PERMISSION = [...DEFAULT_PERMISSION, "nysc:create", "nysc:delete", "nysc:update", "siwes:create", "siwes:delete", "siwes:update", "intern:create", "intern:update", "intern:delete", "user:read", "user:write"]
export const DEPARTMENT_PERMISSION = [...DEFAULT_PERMISSION, "schedule:create", "schedule:update", "schedule:delete", "staff:read"]
//Query
export const MAX_RESULT_LIMIT = 50
export const USER_SORT_OPTION = { firstName: 1, lastName: 1, createdAt: 1, updatedAt: 1, email: 1 }
export const IMMUTABLE_USER_FIELD = ["deleted", "deletedOn", "password", "role", "email", "active", "createdAt", "updatedAt", "changedPassword", "_id"]

export enum UserTypes {
    Nysc = "Nysc",
    Siwes = "Siwes",
    Intern = "Intern",
    Staff = "Staff"
}
//OTP
export const MAX_OTP_TIME = 10
export const MAX_OTP_TIME_IN_SECONDS = 60 * MAX_OTP_TIME
export const TIME_TOLERANCE_FOR_OTP = 50 / 100
