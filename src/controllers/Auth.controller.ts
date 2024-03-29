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
import { LoginResponse } from "../models/LoginResponse.model.js";
import { IAuthToken } from "../interfaces/IAuthToken.interface.js";

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
                            response.message = "Email già presente";
                            response.data = true;
                            res.send(response);
                        }
                        else
                        {
                            response.data = false;
                            res.status(200).send(response);
                        }
                    } catch (err)
                    {
                        this.log.fileLog(JSON.stringify(err));
                        response.error.desc = (err as any).message;
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

                        if (!body) return res.status(400).send(initSR({ message: "Invalid body", error: { num: 400, desc: "Body unsupported" } }));
                        if (!body.email || !REGEX_EMAIL.test(body.email)) return res.status(400).send(initSR({ message: "Invalid email", error: { num: 400, desc: "Bad Email" } }));
                        if (!body.pwd) return res.status(400).send(initSR({ message: "Invalid password", error: { num: 400, desc: "Bad Password" } }));
                        const pwd: string = body.pwd;
                        const hash = crypto.createHash(this.env.configHost.encryption.algorithm).update(pwd.trim()).digest(this.env.configHost.encryption.encoding);
                        const user = await authService.login(body.email, hash);
                        if (user)
                        {
                            response.data = authService.tokenGeneration(user, secret + user.SaltRefresh);
                            res.status(200).send(response);
                        }
                        else
                        {
                            response.message = "User not found";
                            res.status(404).send(response);
                        }
                    } catch (err)
                    {
                        this.log.fileLog(JSON.stringify(err));
                        response.error.desc = (err as any).message;
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
                        const userFromToken = (req as any).user as IAuthToken;
                        try
                        {
                            const id = userFromToken.id;
                            const user = await uservice.getAuth(id);
                       
                            if (user)
                            {
                                verify(rtoken, secret + user.SaltRefresh) as JwtPayload;
                                const updated = await uservice.updateSalt(user.Id, user.SaltRefresh + 1);

                                response.data = uservice.tokenGeneration(user, secret + user.SaltRefresh);
                                res.status(200).send(response);
                            }

                        } catch (error)
                        {
                            const err = error as any;
                            if (err.name === "TokenExpiredError")
                            {
                                response.error.desc = err.message;
                                response.message = "Token scaduto";
                            }
                            if (err.name === "JsonWebTokenError")
                            {
                                response.error.desc = err.message;
                                response.message = "Token non valido";
                            }
                            res.status(401).send(response);
                        }

                    } catch (err)
                    {
                        response.error.desc = (err as any).message;
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
                        if (!mail || !REGEX_EMAIL.test(mail)) return res.status(400).send(initSR({ message: "Email non valida", error: { num: 400, desc: "Bad Email" } }));
                        const auth = await authService.getAuthByEmail(mail);
                        if (auth)
                        {
                            await emailservice.sendEmailRecovery(auth.Email);
                            response.message = "Email inviata";
                            res.status(200).send(response)
                        }
                        else
                        {
                            response.message = "Utente non trovato";
                            res.status(400).send(response);
                        }
                    } catch (err)
                    {
                        this.log.fileLog(JSON.stringify(err as any));
                        response.error.desc = (err as any).message;
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
                        if (!req.params.token) return res.status(400).send(initSR({ message: "Dati non validi", error: { num: 400, desc: "Token unsupported" } }));
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
                                    response.data = "Password Resettata";
                                    response.message = "Password Resettata"
                                    res.redirect(`https://${this.env.configHost.server[0].host}:${this.env.configHost.server[0].port}/login?message=Password Resettata`)
                                }
                                else
                                {
                                    response.message = "C'è un problema, riprova più tardi"
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
                        response.error.desc = (err as any).message;
                        res.status(500).send(response);
                    }
                }).route;
    }
}