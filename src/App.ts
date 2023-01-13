import { Express, json, RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { readdirSync } from "fs";
import { join } from "path";
import { ParsedQs } from "qs";
import { IConfigHost } from "./interfaces/IConfigHost.interface";
import { AppEnvironment } from "./AppEnvironment";
import { _IS_DEVELOPMENT_ } from "./common/Globals.common";
import { getMethods } from "./common/Utils.common";
import { IControllerTuple } from "./interfaces/IControllerTuple.interface";
import cors from 'cors'
import { Route, Routes } from "./common/Routes.common";


export class App
{
    private _env: AppEnvironment;
    public constructor(server: Express)
    {
        this._env = new AppEnvironment(server, _IS_DEVELOPMENT_, Routes);
        // abilito le risposte in json
        this._env.server.use(json());
        this._env.server.use(cors());

    }

    public appMiddlewares(...handlers: ((env: AppEnvironment) => RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>)[]): App
    {
        for (const handler of handlers)
        {
            this._env.server.use(handler(this._env));
        }
        return this;
    }
    /**
    * Load all controllers from controllers folder
    */
    private loadControllers(): IControllerTuple[]
    {
        const result: IControllerTuple[] = [];
        const controllers = readdirSync("./controllers").where(x => x.endsWith(".controller.js"));
        for (const controller of controllers)
        {
            const currController = require("./" + join("./controllers", controller));
            const name = Object.keys(currController)[0];
            result.push({
                controllerClass: currController,
                instance: new (currController[name])(this._env)
            });
        }
        return result;
    }
    public listen(listenCallback: (config: IConfigHost) => void)
    {
        const log = this._env.logger;
        const controllers = this.loadControllers();
        log.info("Start Endpoint Configuration ------------------------------------------ \n");
        for (const controller of controllers)
        {
            log.info("Controller: " + Object.keys(controller.controllerClass)[0] + " -----------------\n");
            const methods = getMethods(controller.instance);
            for (const method of methods)
            {
                const temp: any = controller.instance;
                const path: Route = temp[method]();
                if (path.path === undefined)
                    throw new Error(`Method ${method} in controller ${Object.keys(controller.controllerClass)[0]} is not a valid endpoint`);
                this._env.setRoute(path);
                log.log(`${log.tab(1)}Initialzied ${log.evidence(method)} with endpoint's method ${log.evidence(path.method.toUpperCase())} and path: ${log.evidence(path.path)}`);
            }
            log.log("");
        }
        log.info("End Endpoint Configuration ------------------------------------------");
        this._env.server.listen(
            this._env.configHost.server.port,
            this._env.configHost.server.host,
            () => { listenCallback(this._env.configHost) });
    }

}
