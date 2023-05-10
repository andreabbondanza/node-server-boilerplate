import { App } from "./App.js";
import express from "express";
import dewlinq from "dewlinq";
import { routeMiddleware } from "./middlewares/RouteMiddleware.middleware.js";
import { AppEnvironment } from "./AppEnvironment.js";
import { log } from "./middlewares/Log.middleware.js";
import { _IS_DEVELOPMENT_ } from "./common/Globals.common.js";
import cors from "cors";
import { apiKeyCheckMiddleware } from "./middlewares/ApiKeyCheckMiddleware.js";

dewlinq.default();


const server = new App(express(), _IS_DEVELOPMENT_);

server
    .appSetup((app) =>
    {
        app.use(express.json());
        app.use(cors())
    })
    .appCustomMiddlewares(
        (env: AppEnvironment) => (req, res, next) =>
        {
            env.logger.debug(env.logger.evidence("NEW REQUEST :\n STARTS MIDDLEWARES------------------------------\n"));
            next();
        },
        log,
        apiKeyCheckMiddleware,
        routeMiddleware,
        (env: AppEnvironment) => (req, res, next) =>
        {
            env.logger.debug(env.logger.evidence("ENDS MIDDLEWARES------------------------------\n"));
            next();
        })
    .listen((env, host, port) =>
    {
        env.logger.log(`listening ${host} on port ${env.logger.evidence(port.toString())}`)
    })

