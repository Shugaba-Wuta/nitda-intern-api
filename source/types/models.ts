import mongoose, { Model, Document, ObjectId } from "mongoose"
import { UserTypes } from "../config/data"

export interface startPassResetFlowOptions {
    sessionID: string,
    userAgent: string | undefined,
    IPAddress: string[] | string
}
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
    location: string,
    changedPassword: boolean,
    comparePassword(password: string): Promise<boolean>,
    startPassResetFlow(options: startPassResetFlowOptions): Promise<string>
    save(): Promise<IUserBase>

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
export interface IOTP {
    _id?: string | ObjectId
    user: ObjectId,
    OTPCode: string,
    purpose: string,
    email?: string,
    used: boolean,
    createdAt?: Date,
    updatedAt?: Date,
    schema: UserTypes,

}
export interface IAccount {
    _id?: string | ObjectId
    bankName: string,
    accountNumber: string,
    bankCode?: string,
    intern?: string | ObjectId,
    internSchema?: string,
}

export interface INextOfKin {
    _id?: string | ObjectId
    intern?: string | ObjectId,
    internSchema?: string,
    phoneNumber: string,
    name: string,
    email?: string
}
export interface IDocument {
    _id?: string | ObjectId,
    slug: string,
    link: string,
    deleted?: boolean,
    deletedOn?: Date,
    userSchema: string,
    user: string | ObjectId,
    createdAt?: Date,
    updatedAt?: Date,

}