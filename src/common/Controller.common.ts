

import { IController } from "../interfaces/IController.interface";
import { Express, Request, RequestHandler } from "express";
import { AppEnvironment } from "../AppEnvironment";
import { DBService } from "../services/DBService.service";
import { IService } from "../interfaces/IService.interface";
import { ParsedQs } from "qs";
import { IAuthToken } from "../interfaces/IAuthToken.interface";
import { Logger } from "../common/Logger.common";
import { Service } from "../common/Service.common";
import { Roles } from "../shared/Auth.model";
import { Method, Route } from "./Routes.common";
import { FileService } from "../services/FileService.service";
import { ParamsDictionary } from "express-serve-static-core";
import { Endpoint } from "./Endpoint.common";


export class Controller implements IController
{
    private _env: AppEnvironment;
    public get env(): AppEnvironment
    {
        return this._env;
    }
    protected server: Express;
    protected baseApiPath: string = "/api/v1/";
    protected controllerPath: string = "";
    private _dbService: DBService | null = null;
    private _fsService: FileService | null = null;
    private _log: Logger;
    protected get log(): Logger
    {
        return this._log;
    }
    public get fileService(): FileService
    {
        if (!this._fsService)
            this._fsService = new FileService(this.env);
        return this._fsService;
    }
    public get dbService()
    {
        if (!this._dbService)
            this._dbService = new DBService(this.env);
        return this._dbService;
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
    protected _getService<T extends IService>(): T
    {
        //    const t = new T();
        return {} as T;

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
    protected initService<T extends Service>(service: IService): T
    {
        return service.init(this) as T;
    }


    /**
     * Create routing object
     * @param path The path
     * @param roles routing roles
     * @param toTest regex for path
     * @param method http method
     * @returns the route object
     */
    public _buildRoute(path: string, roles: Roles[], method: Method = "get", toTest?: RegExp): Route
    {
        let stringToTest = toTest?.source;
        let endingTest = / /;
        if (!toTest)
        {
            stringToTest = path.replace(/:(\w+)/gi, "[A-z0-9\-\@\.]+")
            endingTest = /\/{0,1}$/;
        }
        const baseRegexp: RegExp = /\/api\/v[0-9]+\//;
        const controllerRegexp: RegExp = new RegExp(`${this.controllerPath}`);
        const test: RegExp = new RegExp(baseRegexp.source + controllerRegexp.source + stringToTest + endingTest.source);
        const route: Route = new Route(
            this._buildPath(path),
            roles,
            test,
            method
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
    public _registerEndpoint(path: string, roles: Roles[], method: Method = "get"): Endpoint
    {
        return new Endpoint(this.server, this._buildRoute(path, roles, method));
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
        this._log = new Logger();
        this.controllerPath = controllerPath;
    }
}
