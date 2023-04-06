export const GENDERS = ["M", "F"]

export const QUALIFICATION = ["BSc.", "MSc.", "BEng.", "MEng.", "BA", "PhD.", "HND", "LLB"]

export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

export const INTERNSHIP_STATUS = ["Ongoing", "Done", "Aborted"]

export const COOKIE_DURATION = "12h"

export const TOKEN_DURATION = "10m"

export const HR_ROLE = "HR"
export const ADMIN_ROLE = "Admin"
export const NYSC_ROLE = "Nysc"
export const DEPARTMENT_ROLE = "Department"
export const SIWES_ROLE = "Siwes"
export const INTERN_ROLE = "Intern"
export const USER_STAFF = "Staff"
export const USER_NYSC = NYSC_ROLE
export const USER_SIWES = SIWES_ROLE
export const USER_INTERN = INTERN_ROLE

export const USER_SCHEMA = [NYSC_ROLE, SIWES_ROLE, INTERN_ROLE, USER_STAFF]
export const INTERN_SCHEMA = USER_SCHEMA.filter(item => {
    return item !== USER_STAFF
})



// export const USER_ROLE_LEVEL3 = ["Associate"]
export const USER_ROLE_LEVEL3 = [DEPARTMENT_ROLE, ADMIN_ROLE, HR_ROLE, NYSC_ROLE, SIWES_ROLE, INTERN_ROLE]
export const USER_ROLE_LEVEL2 = [DEPARTMENT_ROLE, ADMIN_ROLE, HR_ROLE]
export const USER_ROLE_LEVEL1 = [ADMIN_ROLE, HR_ROLE]
export const USER_ROLE_LEVEL0 = [ADMIN_ROLE]
export const ASSOCIATE_SCHEMA = [NYSC_ROLE, SIWES_ROLE, INTERN_ROLE]
//Permissions
export const DEFAULT_PERMISSION = ["nysc:read", "siwes:read", "intern:read", "schedule:read"]
export const ELEVATED_STAFF_PERMISSION = [...DEFAULT_PERMISSION, "nysc:create", "nysc:delete", "nysc:update", "siwes:create", "siwes:delete", "siwes:update", "intern:create", "intern:update", "intern:delete", "user:read", "user:write"]
export const DEPARTMENT_PERMISSION = [...DEFAULT_PERMISSION, "schedule:create", "schedule:update", "schedule:delete", "staff:read"]
//Query
export const MAX_RESULT_LIMIT = 50
export const USER_SORT_OPTION = { firstName: 1, lastName: 1, createdAt: 1, updatedAt: 1, email: 1 }

export const IMMUTABLE_USER_FIELD = ["deleted", "deletedOn", "password", "role", "email", "active", "createdAt", "updatedAt", "changedPassword", "_id"]
export const ADMIN_ONLY_MUTABLE_FIELDS = ["highestQualification", "phoneNumber", "status", "onPayroll", "schoolOfStudy", "courseOfStudy", "callUpNumber", "classOfDegree", "LGIContact", "zonalInspectorContact", "schoolID", "schoolContact", "account", "nextOfKin", "department", "nitdaID", "expectedEndDate", "startDate", "location", "permissions"]
export const DEPARTMENT_ONLY_MUTABLE_FIELDS = ["schedule", "cdsDays", "assignedOffice",]

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
