import { IConfigHost } from "./interfaces/IConfigHost.interface";
import { readFileSync } from "fs";
import { Express } from "express";
import { Logger } from "./common/Logger.common";
import { IRouteIndex } from "./interfaces/IRouteIndex.interfaces";
import { Route } from "./common/Routes.common";

export class AppEnvironment
{
    private _server: Express;
    private _routes: IRouteIndex;
    private readonly isDev: boolean;
    private _configHost: IConfigHost;
    public setRoute(route: Route)
    {
        this._routes[route.path] = route;
    }
    public get routes(): IRouteIndex
    {
        return this._routes;
    }
    private _logger: Logger = new Logger();

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
        this.isDev = isDev;
        const text = readFileSync((this.isDev ? "dev-" : "") + "host.json", { encoding: "utf-8" });
        this._configHost = JSON.parse(text);
    }

}