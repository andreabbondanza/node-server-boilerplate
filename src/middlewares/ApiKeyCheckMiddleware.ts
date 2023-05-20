import { ParsedQs } from "qs";
import { RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { getRoute, initSR } from "../common/Utils.common.js";
import { AppEnvironment } from "../AppEnvironment.js";


export function apiKeyCheckMiddleware(env: AppEnvironment): RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>
{
    return (req, res, next) =>
    {
        // if (/api\/v[0-9]+\/public/.test(req.path))
        const path = getRoute(env.routes, req.path, req.method);
        const response = initSR();
        // the path exists
        if (path !== null)
        {
            // check if it's api
            if (path.custom["isApi"] === undefined)
            {
                next();
            }
            else
            {
                const apikey = req.headers["x-api-key"] as string;
                if (env.configHost.app.apikey === apikey)
                {
                    next();
                }
                else
                {
                    response.error.desc = "Forbidden resource";
                    response.message = "You cannot access this resource";
                    env.logger.debug("\n");
                    // tutto il resto
                    return res.status(401).send(response);
                }


                env.logger.debug("\n");
            }
        }
        else
        {
            env.logger.debug("\n");
            response.error.desc = "Page not found";
            response.message = "Url not found";
            return res.status(404).send(response)
        }

    }
}