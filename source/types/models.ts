import mongoose, { Model, Document, ObjectId } from "mongoose"


export interface IUserBase {
    _id: string | ObjectId
    firstName: string,
    middleName?: string,
    lastName: string,
    role: string,
    permissions: string[],
    password?: string,
    email: string,
    deleted?: boolean,
    nitdaID: string,
    deletedOn?: Date,
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
    readonly duration?: string //virtual prop,
    readonly account: string | ObjectId
    readonly nextOfKin: string | ObjectId
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
    _id?: string | ObjectId
    user?: ObjectId | string,
    userSchema: string,
    ip: string | string[],
    userAgent: string,
    createdAt?: Date,
    updatedAt?: Date,
    activityStackTrace?: ObjectId | string //virtual prop

}
export interface IAccount {
    bankName: string,
    accountNumber: string,
    bankCode?: string,
    intern: string | ObjectId,
    internSchema: string,
    // default: boolean
}

export interface INextOfKin {
    intern: string | ObjectId,
    internSchema: string,
    phoneNumber: string,
    name: string,
    email?: string
}