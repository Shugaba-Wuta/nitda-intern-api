import mongoose, { Model, Document } from "mongoose"


export interface IUserBase {
    firstName: string,
    middleName?: string,
    lastName: string,
    role: string,
    permissions: string[],
    password: string,
    email: string,
    deleted: boolean,
    nitdaID: string,
    deletedOn: Date,
    active: boolean,
    createdAt?: Date,
    updatedAt?: Date,
    department: string,

}
export interface IUserBaseMethods {
    comparePassword(password: string): boolean
}

export interface IStaff extends IUserBase {
    jobTitle: string,

}


export interface IInternBase extends IUserBase {
    highestQualification: string,
    gender: string,
    phoneNumber: string,
    assignedOffice?: string,
    status: string,
    expectedEndDate: Date,
    startDate: Date,
    onPayroll: boolean,
    schoolOfStudy: string,
    courseOfStudy: string,
    readonly duration?: string //virtual prop
}

export interface INysc extends IInternBase {
    cdsDay: string,
    classOfDegree: string,
    callUpNumber: string,
    stateCode: string,
    LGIContact: string,
    zonalInspectorContact: string,
}
export interface IIntern extends IInternBase {

}
export interface ISiwes extends IInternBase {
    schoolID: string,
    schoolContact: string,
}
export interface ISession {
    _id?: string | mongoose.Types.ObjectId
    user?: mongoose.Types.ObjectId | string,
    userSchema: string,
    ip: string | string[],
    userAgent: string,
    createdAt?: Date,
    updatedAt?: Date,
    activityStackTrace?: mongoose.Types.ObjectId | string //virtual prop

}