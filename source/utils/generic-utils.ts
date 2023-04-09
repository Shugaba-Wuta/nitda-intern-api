import Docxtemplater from "docxtemplater"
import PizZip from "pizzip"
import path from "path"
import fs from "fs"
import { promisify } from "util"
import { UploadedFile } from "express-fileupload"
import { IDocument } from "models"
import { Documents } from "../models"
export const getReadableDate = function () {
    let date = new Date()
    let months = ["January", "February",
        "March", "April", "May", "June",
        "July", "August", "September",
        "October", "November", "December"]
    return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getFullYear()}`
}

export const formatTemplate = async function (templateName: string, data: { callUpNumber?: string, fullName?: string, gender?: string, courseOfStudy?: string, stateCode: string, }) {
    const date = getReadableDate()
    const dir = path.resolve(__basedir, "static", "templates", templateName)
    const readFile = promisify(fs.readFile)
    const content = await readFile(dir)
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });
    await doc.renderAsync({ ...data, date })
    const bufferOutput = doc.getZip().generate({
        type: "nodebuffer",
        compression: "DEFLATE",
    })
    return bufferOutput
}
export const generateSlug = (text: string) => {

    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')

}

export const saveFileToServer = async (parentPaths: string[], files: UploadedFile[], user: string, userSchema: string) => {
    const newDocs: IDocument[] = []
    const parentDir = path.resolve(__basedir, ...parentPaths, userSchema, user)
    for await (const file of files) {
        const parsedFinalName = path.parse(file.name)
        const slug: string = generateSlug(parsedFinalName.name)
        const filePath: string = path.resolve(parentDir, slug + parsedFinalName.ext)
        await file.mv(filePath)
        let docs: IDocument = { slug, link: path.resolve(parentDir, file.name), userSchema, user }
        newDocs.push(docs)
    }
    return await Documents.insertMany(newDocs)

}