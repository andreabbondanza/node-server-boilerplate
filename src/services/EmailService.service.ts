import { Service } from "../common/Service.common.js"
import { createTransport } from "nodemailer";
import jwt from "jsonwebtoken";
import { DateTime } from "luxon";



export class EmailService extends Service
{
    public async sendEmailRecovery(email: string)
    {
        const { sign } = jwt;
        const transporter = createTransport({
            host: this.env.configHost.email.host,
            port: this.env.configHost.email.port,
            auth: {
                user: this.env.configHost.email.user,
                pass: this.env.configHost.email.pass
            }
        });
        const temp = sign({ expDate: DateTime.now().plus({ minutes: 5 }), email: email }, this.env.configHost.app.secret, { algorithm: "HS512" });
        const mailOptions = {
            from: this.env.configHost.email.from,
            to: email,
            subject: "Password Resettata per il sito: " + this.env.configHost.app.name,
            html: ``
        };
        await transporter.sendMail(mailOptions);
    }

    public async sendEmailPassword(email: string, password: string)
    {
        const { sign } = jwt;
        const transporter = createTransport({
            host: this.env.configHost.email.host,
            port: this.env.configHost.email.port,
            auth: {
                user: this.env.configHost.email.user,
                pass: this.env.configHost.email.pass
            }
        });
        const temp = sign({ expDate: DateTime.now().plus({ minutes: 5 }), email: email }, this.env.configHost.app.secret, { algorithm: "HS512" });
        const mailOptions = {
            from: this.env.configHost.email.from,
            to: email,
            subject: "Reset Password",
            html: `La tua nuova password è: ${password}`
        };

        await transporter.sendMail(mailOptions);
    }

}