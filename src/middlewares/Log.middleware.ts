import { ParsedQs } from "qs";
import { RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { JwtPayload, verify } from "jsonwebtoken";
import { initSR } from "../common/Utils.common";
import { AppEnvironment } from "../AppEnvironment";
import { IAuthToken } from "../interfaces/IAuthToken.interface";
import { DateTime } from "luxon";


export function log(env: AppEnvironment): RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>
{
    return (req, res, next) =>
    {
        env.logger.debug(env.logger.evidence("MIDDLEWARE LOG"));
        env.logger.debug(DateTime.now().toFormat("dd/MM/yyyy HH:mm") + ": " + env.logger.evidence(req.path));
        env.logger.debug("BODY");
        env.logger.debug(env.logger.evidence(JSON.stringify(req.body)) + "\n");
        next();
    }
}