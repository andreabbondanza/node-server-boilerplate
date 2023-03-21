import { IConfigHost } from "./interfaces/IConfigHost.interface";
import { readFileSync } from "fs";
import { Express } from "express";
import { Logger } from "./common/Logger.common";
import { IRouteIndex } from "./interfaces/IRouteIndex.interfaces";
import { Route } from "./common/Routes.common";
import { IRepository } from "./interfaces/IRepository";

export class AppEnvironment
{
    private _server: Express;
    private _routes: IRouteIndex;
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
        this._routes[route.path + "-" + route.method] = route;
    }
    /**
     * Add a new repository
     * @param key repokey (usually class name)
     * @param repo repository instance
     */
    public pushRepository(key: string, repo: IRepository)
    {
        this._repositories.set(key, repo);
    }

    /**
     * Get a repository instance
     * @param key repository key
     * @returns repository instance 
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
    public constructor(server: Express, isDev: boolean, routes: IRouteIndex)
    {
        this._routes = routes;
        this._server = server;
        this._logger = new Logger(isDev);
        this.isDev = isDev;
        const text = readFileSync((this.isDev ? "dev-" : "") + "host.json", { encoding: "utf-8" });
        this._configHost = JSON.parse(text);
    }

}