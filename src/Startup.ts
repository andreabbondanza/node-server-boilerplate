import { App } from "./App";
import express from "express";
import init from "dewlinq";
import { Logger } from "./common/Logger.common";
import { routeMiddleware } from "./middlewares/RouteMiddleware.middleware";
import { AppEnvironment } from "./AppEnvironment";
import { log } from "./middlewares/Log.middleware";

init();


const server = new App(express());

server
    .appMiddlewares((env: AppEnvironment) => (req, res, next) =>
    {
        env.logger.debug(env.logger.evidence("NUOVA RICHIESTA:\nINIZIO MIDDLEWARES------------------------------\n"));
        next();
    },
        log,
        routeMiddleware,
        (env: AppEnvironment) => (req, res, next) =>
        {
            env.logger.debug(env.logger.evidence("FINE MIDDLEWARES------------------------------\n"));
            next();
        })
    .listen((config) =>
    {
        console.log("listening on " + config.server.port)
        // logger.log(`In ascolto su indirizzo: ${config.server.host}
        //         e porta: ${config.server.port}`)
    })

