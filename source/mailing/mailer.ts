import { createTestAccount, createTransport } from "nodemailer"
import hbs from "nodemailer-express-handlebars"
import Mail, { Options } from "nodemailer/lib/mailer";

type ExtendedOptions = Options & { template: string, context: object };


interface ISMTPConfig {
    host?: string
    port?: number
    secure?: boolean
    user?: string
    password?: string
}

class SysEmail {
    host: string
    port: number
    secure: boolean
    user: string
    password: string
    test: boolean


    constructor(SMTPConfig?: ISMTPConfig, test: boolean = false) {
        this.host = SMTPConfig?.host || "smtp.ethereal.email"
        this.port = SMTPConfig?.port || 587
        this.secure = SMTPConfig?.secure || false
        this.user = SMTPConfig?.user || ""
        this.password = SMTPConfig?.password || ""
        this.test = test
    }

    async getTransporter() {
        if (this.test) {
            const testAccount = await createTestAccount()
            this.user = testAccount.user
            this.password = testAccount.pass
        }
        const transporter = createTransport({
            host: this.host,
            port: this.port,
            secure: this.secure,
            auth: {
                user: this.user,
                pass: this.password,
            }

        })
        return transporter
    }

    async sendEmail(
        recipient: string,
        from: string,
        context: object,
        template: string,
        subject: string) {
        const transporter = await this.getTransporter()
        transporter.use("compile", hbs({
            viewEngine: {
                extname: '.hbs',
                layoutsDir: 'templates/',
                defaultLayout: false,
                partialsDir: 'templates/partials',
            },
            viewPath: 'templates/',
            extName: '.hbs'
        }))
        const options: ExtendedOptions = {
            from,
            to: recipient,
            subject,
            template,
            context
        }
        transporter.sendMail(options)
    }
}


export default new SysEmail({}, true)
