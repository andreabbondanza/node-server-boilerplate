import { Express, RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { readdirSync } from "fs";
import { join } from "path";
import { ParsedQs } from "qs";
import { AppEnvironment } from "./AppEnvironment.js";
import { getMethods } from "./common/Utils.common.js";
import { IControllerTuple } from "./interfaces/IControllerTuple.interface.js";
import { dirname, resolve } from "path";
import { Route, Routes } from "./common/Routes.common.js";


export class App
{
    private _env: AppEnvironment;

    /**
     * App Constructor
     * @param server the server express instance
     * @param isDev boolean value to set the environment in dev mode
     */
    public constructor(server: Express, isDev: boolean = false)
    {
        this._env = new AppEnvironment(server, isDev, Routes, resolve(dirname("")));
    }

    /**
     * Initialize application
     * @param app 
     * @returns App Instance
     */

    public appSetup(app: (app: Express) => void): App
    {
        app(this._env.server);
        return this;
    }

    /**
     * initialize all middlewares
     * @param handlers list of middlewares 
     * @returns App instance
     */

    public appCustomMiddlewares(...handlers: ((env: AppEnvironment) => RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>)[]): App
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
    private async loadControllers(): Promise<IControllerTuple[]>
    {
        const result: IControllerTuple[] = [];
        const controllers = readdirSync("./controllers").where(x => x.endsWith(".controller.js"));
        for (const controller of controllers)
        {
            const currController = await import("./" + join("./controllers", controller));
            const name = Object.keys(currController)[0];
            result.push({
                controllerClass: currController,
                instance: new (currController[name])(this._env)
            });
        }
        return result;
    }

    /**
     * Load all repositories from repositories folder
     */

    private async loadRepositories(): Promise<void>
    {
        const repos = readdirSync("./repositories").where(x => x.endsWith(".repository.js"));
        for (const repo of repos)
        {
            const currRepo = await import("./" + join("./repositories", repo));
            const name = Object.keys(currRepo)[0];
            this._env.pushRepository(name, new (currRepo[name])(this._env.configHost, this._env.logger));    
        }        
    }

    /**
     * Listener for the server
     * @param listenCallback 
     */

    public async listen(listenCallback: (config: AppEnvironment, host: string, port: number) => void)
    {
        const log = this._env.logger;
        this.loadRepositories();
        const controllers = await this.loadControllers();
        log.info("Start Endpoint Configuration ------------------------------------------ \n");
        for (const controller of controllers)
        {
            log.info("Controller: " + Object.keys(controller.controllerClass)[0] + " -----------------\n");
            const methods = getMethods(controller.instance);
            for (const method of methods)
            {
                const temp: any = controller.instance;
                const path: Route = temp[method]();
                if (path.paths === undefined)
                    throw new Error(`Method ${method} in controller ${Object.keys(controller.controllerClass)[0]} is not a valid endpoint`);
                this._env.setRoute(path);
                log.log(`${log.tab(1)}Initialzied ${log.evidence(method)} with endpoint's method ${log.evidence(path.method.toUpperCase())} and path: ${log.evidence(path.paths.map(x => x.path).join(", "))}`);
            }
            log.log("");
        }
        log.info("End Endpoint Configuration ------------------------------------------");
        for (const configServer of this._env.configHost.server)
        {
            this._env.server.listen(
                configServer.port,
                configServer.host,
                () => { listenCallback(this._env, configServer.host, configServer.port) });

        }
    }

}
