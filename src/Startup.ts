import { App } from "./App";
import express from "express";
import init from "dewlinq";
import { routeMiddleware } from "./middlewares/RouteMiddleware.middleware";
import { AppEnvironment } from "./AppEnvironment";
import { log } from "./middlewares/Log.middleware";
import { _IS_DEVELOPMENT_ } from "./common/Globals.common";
import cors from "cors";
import { apiKeyCheckMiddleware } from "./middlewares/ApiKeyCheckMiddleware";

init();


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
    .listen((env) =>
    {
        env.logger.log("listening on " + env.logger.evidence(env.configHost.server.port.toString()))
    })

