

import { IController } from "../interfaces/IController.interface.js";
import { Express, Request, RequestHandler } from "express";
import { AppEnvironment } from "../AppEnvironment.js";
import { IService } from "../interfaces/IService.interface.js";
import { ParsedQs } from "qs";
import { IAuthToken } from "../interfaces/IAuthToken.interface.js";
import { Logger } from "../common/Logger.common.js";
import { Service } from "../common/Service.common.js";
import { Roles } from "../model/Auth.model.js";
import { Route } from "./Routes.common.js";
import { Endpoint } from "./Endpoint.common.js";
import { Method } from "./Methods.common.js";
import { escapeRegExp } from "./Utils.common.js";


export class Controller implements IController
{
    private _env: AppEnvironment;
    public get env(): AppEnvironment
    {
        return this._env;
    }
    protected server: Express;
    protected baseApiPath: string = "/api/";
    protected controllerPath: string = "";
    private _log: Logger;
    protected get log(): Logger
    {
        return this._log;
    }
    
    /**
     * Help to build path
     * @param path path to add to the base
     * @returns
     */
    protected _buildPath(path: string)
    {
        return `${this.baseApiPath}${this.controllerPath}${path}`;
    }

    /**
     * Return user auth type
     * @param req request object
     * @returns
     */
    protected _getUserAuthFromRequest(req: Request<{}, any, any, ParsedQs, Record<string, any>>): IAuthToken
    {
        return (req as any).user as IAuthToken;
    }
    /**
     * Init a service
     * @param service istance of the service to init
     * @returns 
     */
    protected _initService<T extends Service>(service: IService): T
    {
        return service.init(this._env) as T;
    }

    /**
     * Create routing object
     * @param path The path
     * @param roles routing roles
     * @param pathRegex regex for path
     * @param method http method
     * @returns the route object
     */
    public _buildRoute(path: string, roles: Roles[], method: Method = "get", custom: { [key: string]: string | boolean } = {}, pathRegex?: RegExp): Route
    {
        let stringToTest = pathRegex?.source;
        let endingTest = / /;
        if (!pathRegex)
        {
            stringToTest = path.replace(/:(\w+)/gi, "[A-z0-9\-\@\.]+")
            endingTest = /\/{0,1}$/;
        }
        const baseRegexp: RegExp = new RegExp(`${escapeRegExp(this.baseApiPath)}`);
        const controllerRegexp: RegExp = new RegExp(`${escapeRegExp(this.controllerPath)}`);
        const test: RegExp = new RegExp(baseRegexp.source + controllerRegexp.source + stringToTest + endingTest.source);
        const route: Route = new Route(
            this._buildPath(path),
            roles,
            test,
            method,
            custom
        );
        return route;
    }

    /**
     * Regiter a new endpoint
     * @param path path of the endpoint
     * @param roles roles for the endpoint
     * @param method endopint method
     * @returns endpoint object
     */
    public _registerEndpoint(path: string, roles: Roles[], method: Method = "get", custom: { [key: string]: string | boolean } = {}): Endpoint
    {
        return new Endpoint(this.server, this._buildRoute(path, roles, method, custom));
    }

    /**
     * Common control constructor
     * @param env the environment so you can find it in this object
     * @param controllerPath the controller path without the "/" at the end
     */
    public constructor(env: AppEnvironment, controllerPath: string = "")
    {
        this._env = env;
        this.server = env.server;
        this._log = new Logger(env.isDev);
        this.controllerPath = controllerPath;
        this.baseApiPath = env.configHost.app.baseApiPath !== "" ? env.configHost.app.baseApiPath : this.baseApiPath;
    }
}
