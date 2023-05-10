import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { DateTime } from "luxon";
import crypto from "crypto";
import { AppEnvironment } from "../AppEnvironment.js";
import { Controller } from "../common/Controller.common.js";
import { initSR, REGEX_EMAIL } from "../common/Utils.common.js";
import { IStandardResponse } from "../interfaces/IStandardResponse.interface.js";
import { Route } from "../common/Routes.common.js";
import { AuthService } from "../services/Auth.service.js";
import { EmailService } from "../services/EmailService.service.js";
import generator from "easy-password-gen";
import { LoginResponse } from "../model/LoginResponse.model.js";

/**
 * NOTE: ALl methods that start with _ will not be "ROUTED" at server startup
 * NOTA: Tutti i metodi che iniziano con _ non saranno "ROUTIZZATI" all'avvio del server
 */export class AuthController extends Controller
{
    public constructor(env: AppEnvironment)
    {
        super(env, "auth");
    }

    /**
     * Get email
     * @returns 
     */
    public getEmail(): Route
    {
        return this._registerEndpoint(
            "/checkmail/:email",
            ["public"]).endpoint(
                async (req, res) =>
                {
                    const response: IStandardResponse<any> = initSR();
                    try
                    {
                        const mail = req.params.email;
                        const pservice = this._initService<AuthService>(new AuthService());
                        const user = await pservice.getAuthByEmail(mail);
                        if (user)
                        {
                            response.Message = "Email già presente";
                            response.Data = true;
                            res.send(response);
                        }
                        else
                        {
                            response.Data = false;
                            res.status(200).send(response);
                        }
                    } catch (err)
                    {
                        this.log.fileLog(JSON.stringify(err));
                        response.Error.Desc = (err as any).message;
                        res.status(500).send(response);
                    }
                }).route;
    }

    /**
     * 
     * @returns 
     */
    public login(): Route
    {
        return this._registerEndpoint("/login", ["public"], "post")
            .endpoint(
                async (req, res) =>
                {
                    const response: IStandardResponse<LoginResponse> = initSR();
                    try
                    {
                        const authService = this._initService<AuthService>(new AuthService());
                        const secret = this.env.configHost.app.secret;
                        const body = req.body;

                        if (!body) return res.status(400).send(initSR({ Message: "Invalid body", Error: { Num: 400, Desc: "Body unsupported" } }));
                        if (!body.email || !REGEX_EMAIL.test(body.email)) return res.status(400).send(initSR({ Message: "Invalid email", Error: { Num: 400, Desc: "Bad Email" } }));
                        if (!body.pwd) return res.status(400).send(initSR({ Message: "Invalid password", Error: { Num: 400, Desc: "Bad Password" } }));
                        const pwd: string = body.pwd;
                        const hash = crypto.createHash(this.env.configHost.encryption.algorithm).update(pwd.trim()).digest(this.env.configHost.encryption.encoding);
                        const user = await authService.login(body.email, hash);
                        if (user)
                        {
                            response.Data = authService.tokenGeneration(user, secret);
                            res.status(200).send(response);
                        }
                        else
                        {
                            response.Message = "User not found";
                            res.status(404).send(response);
                        }
                    } catch (err)
                    {
                        this.log.fileLog(JSON.stringify(err));
                        response.Error.Desc = (err as any).message;
                        res.status(500).send(response);
                    }
                }).route;
    }

    public silentLogin(): Route
    {
        return this._registerEndpoint("/refresh", ["public"], "post")
            .endpoint(
                async (req, res) =>
                {
                    const { verify } = jwt;
                    const response: IStandardResponse<LoginResponse> = initSR();
                    try
                    {
                        const uservice = this._initService<AuthService>(new AuthService());
                        const secret = this.env.configHost.app.secret;
                        const rtoken = req.headers["r-token"] as string;
                        try
                        {
                            const verified = verify(rtoken, secret) as JwtPayload;
                            // devo controllare su db se già è stato utilizzato
                            const id = verified["id"] as number;
                            const user = await uservice.getAuth(id);

                            if (user)
                            {
                                response.Data = uservice.tokenGeneration(user, secret);
                                res.status(200).send(response);
                            }

                        } catch (error)
                        {
                            const err = error as any;
                            if (err.name === "TokenExpiredError")
                            {
                                response.Error.Desc = err.message;
                                response.Message = "Token scaduto";
                            }
                            if (err.name === "JsonWebTokenError")
                            {
                                response.Error.Desc = err.message;
                                response.Message = "Token non valido";
                            }
                            res.status(401).send(response);
                        }

                    } catch (err)
                    {
                        response.Error.Desc = (err as any).message;
                        res.status(500).send(response);
                    }
                }).route;
    }

    public forgot_passwaord(): Route
    {
        return this._registerEndpoint("/forgot_password/:email", ["public"])
            .endpoint(
                async (req, res) =>
                {
                    const response: IStandardResponse<any> = initSR();
                    try
                    {
                        const emailservice = this._initService<EmailService>(new EmailService());
                        const authService = this._initService<AuthService>(new AuthService());
                        const mail = req.params.email;
                        if (!mail || !REGEX_EMAIL.test(mail)) return res.status(400).send(initSR({ Message: "Email non valida", Error: { Num: 400, Desc: "Bad Email" } }));
                        const auth = await authService.getAuthByEmail(mail);
                        if (auth)
                        {
                            await emailservice.sendEmailRecovery(auth.Email);
                            response.Message = "Email inviata";
                            res.status(200).send(response)
                        }
                        else
                        {
                            response.Message = "Utente non trovato";
                            res.status(400).send(response);
                        }
                    } catch (err)
                    {
                        this.log.fileLog(JSON.stringify(err as any));
                        response.Error.Desc = (err as any).message;
                        res.status(500).send(response);
                    }
                }).route;
    }

    public recovery(): Route
    {
        return this._registerEndpoint("/recovery_password/:token", ["public"])
            .endpoint(
                async (req, res) =>
                {
                    const { verify } = jwt;
                    const response: IStandardResponse<string> = initSR();
                    try
                    {

                        const emailservice = this._initService<EmailService>(new EmailService());
                        if (!req.params.token) return res.status(400).send(initSR({ Message: "Dati non validi", Error: { Num: 400, Desc: "Token unsupported" } }));
                        const verified = verify(req.params.token, this.env.configHost.app.secret) as JwtPayload;

                        const vdate = verified["expDate"]
                        const vemail = verified["email"]
                        const expiration_date = DateTime.fromISO(vdate)


                        if ((DateTime.fromISO(DateTime.now().toString())) < expiration_date)
                        {
                            const authService = this._initService<AuthService>(new AuthService());
                            const auth = await authService.getAuthByEmail(vemail);
                            const pwd = generator({
                                length: 10,
                                uppercase: true,
                                numbers: true,
                                symbols: false
                            });
                            const hash = crypto.createHash(this.env.configHost.encryption.algorithm).update(pwd).digest(this.env.configHost.encryption.encoding)

                            if (auth)
                            {
                                const updated = await authService.updatePassword(auth.Id, hash);
                                if (updated)
                                {
                                    await emailservice.sendEmailPassword(vemail, pwd);
                                    response.Data = "Password Resettata";
                                    response.Message = "Password Resettata"
                                    res.redirect(`https://${this.env.configHost.server[0].host}:${this.env.configHost.server[0].port}/login?message=Password Resettata`)
                                }
                                else
                                {
                                    response.Message = "C'è un problema, riprova più tardi"
                                }
                            }
                            else
                            {
                                res.status(400).send(response)
                            }
                        }
                    } catch (err)
                    {
                        this.log.fileLog(JSON.stringify(err as any));
                        response.Error.Desc = (err as any).message;
                        res.status(500).send(response);
                    }
                }).route;
    }
}