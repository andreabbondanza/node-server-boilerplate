import { IConfigHost } from "./interfaces/IConfigHost.interface.js";
import { readFileSync } from "fs";
import { Express } from "express";
import { Logger } from "./common/Logger.common.js";
import { IRouteIndex } from "./interfaces/IRouteIndex.interface.js";
import { Route } from "./common/Routes.common.js";
import { IRepository } from "./interfaces/IRepository.interface.js";

export class AppEnvironment
{
    private workDir: string;
    private _server: Express;
    private _routes: IRouteIndex;
    public get workDirectory()
    {
        return this.workDir;
    }
    private _repositories: Map<string, IRepository> = new Map();
    /**
     * Is the environment in dev mode
     */
    public readonly isDev: boolean;
    private _configHost: IConfigHost;
    /**
     * set a new route
     * @param route 
     */
    public setRoute(route: Route)
    {
        this._routes[route.hash + "-" + route.method] = route;
    }
    /**
     * Add a new repository.js"
     * @param key repokey (usually class name)
     * @param repo repository.js" instance
     */
    public pushRepository(key: string, repo: IRepository)
    {
        this._repositories.set(key, repo);
    }

    /**
     * Get a repository.js" instance
     * @param key repository.js" key
     * @returns repository.js" instance 
     */

    public getRepository<T extends IRepository>(key: string): T
    {
        return this._repositories.get(key) as T;
    }

    public get routes(): IRouteIndex
    {
        return this._routes;
    }
    private _logger: Logger;

    public get logger()
    {
        return this._logger;
    }

    public get configHost()
    {
        return this._configHost;
    }
    public get server()
    {
        return this._server;
    }
    public constructor(server: Express, isDev: boolean, routes: IRouteIndex, workDir: string)
    {
        this.workDir = workDir;
        this._routes = routes;
        this._server = server;
        this._logger = new Logger(isDev);
        this.isDev = isDev;
        const text = readFileSync((this.isDev ? "dev-" : "") + "host.json", { encoding: "utf-8" });
        this._configHost = JSON.parse(text);
    }

}