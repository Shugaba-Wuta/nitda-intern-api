import Docxtemplater from "docxtemplater"
import PizZip from "pizzip"
import { resolve } from "path"
import fs from "fs"
import { promisify } from "util"
import { UploadedFile } from "express-fileupload"
import url from "url"
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
    const dir = resolve(__dirname, "source", "static", "templates", templateName)
    console.log(dir)
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

export const saveFileToServer = async (path: string, files: UploadedFile[]) => {

    //
    const urls: { name: string, url: string }[] = []
    for await (const file of files) {
        await file.mv(path)
        urls.push({ name: file.name, url: resolve(path, file.name) })
    }
}