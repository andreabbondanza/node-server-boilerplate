import { ParsedQs } from "qs";
import { RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { getRoute, initSR } from "../common/Utils.common.js";
import { AppEnvironment } from "../AppEnvironment.js";
import { IAuthToken } from "../interfaces/IAuthToken.interface.js";


export function routeMiddleware(env: AppEnvironment): RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>
{
    return (req, res, next) =>
    {
        const { verify } = jwt;
        // if (/api\/v[0-9]+\/public/.test(req.path))
        const path = getRoute(env.routes, req.path, req.method);
        const response = initSR();
        // the path exists
        if (path !== null)
        {
            // check if it's public
            if (path.roles.exists(x => x === "public"))
            { next(); }
            else
            {
                const token = req.headers["x-auth"] as string;
                env.logger.debug(env.logger.evidence("MIDDLEWARE CHECKJWT"));
                env.logger.debug(token);
                if (token && token.split(".").length > 1)
                {
                    try
                    {
                        const verified = verify(token.split(" ")[1], env.configHost.app.secret) as JwtPayload;
                        // append current user to request
                        const user = { id: verified["id"], exp: verified.exp, name: verified["name"], role: verified["role"] } as IAuthToken;
                        (req as any).user = user;
                        // vedo se ho i permessi
                        if (path.roles.exists(x => x === user.role))
                            next();
                        else
                        {
                            response.error.desc = "Forbidden resource";
                            response.message = "Non hai i permessi";
                            env.logger.debug("\n");
                            // tutto il resto
                            res.status(401).send(response);
                        }
                    }
                    catch (error)
                    {
                        const err = error as any;
                        if (err.name === "TokenExpiredError")
                        {
                            response.error.desc = err.message;
                            response.message = "Token expired";
                            //token expired, ask for refresh
                            res.header("x-refresh", "1").status(401).send(response);
                        }
                        else
                        {
                            env.logger.debug(err.name);
                            env.logger.debug(err.message);
                            response.error.desc = err.message;
                            response.message = "Invalid token";
                            env.logger.debug("\n");
                            // all other errors
                            res.status(401).send(response);
                        }
                    }

                }
                else
                {
                    env.logger.debug("\n");
                    response.error.desc = "No token provided";
                    response.message = "No token provided";
                    res.status(401).send(response);
                }
                env.logger.debug("\n");
            }
        }
        else
        {
            env.logger.debug("\n");
            response.error.desc = "Page not found";
            response.message = "Url not found";
            res.status(404).send(response)
        }

    }
}