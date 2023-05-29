import { Express, RequestHandler } from "express";
import { ParsedQs } from "qs";
import { Route } from "./Routes.common.js";
import { ParamsDictionary } from "express-serve-static-core";
import { AppEnvironment } from "../AppEnvironment.js";


export class Endpoint
{
    private server: Express;
    private _env: AppEnvironment;
    private _handlers: ((env: AppEnvironment) => RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>)[] = [];
    private _route: Route;
    /**
     * Get endpoint route object
     */
    public get route(): Route
    {
        return this._route;
    }
    /**
     * Endpoint constructor
     * @param server Express server
     * @param route Route object
     */
    public constructor(server: Express, env: AppEnvironment, route: Route)
    {
        this._route = route;
        this._env = env;
        this.server = server;
    }
    /**
     * Endpoint content
     * @param endpoint endpoint content
     * @returns 
     */
    public endpoint(endpoint: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>): Endpoint
    {
        const paths = this._route.paths.map((path) => path.path);
        this.server.route(paths)[this._route.method](this._handlers.map(x => x(this._env)), endpoint);
        return this;
    }
    /**
     * Add custom data to endpoint's route
     * @param custom custom data
     * @returns the endpoint
     */
    public addCustom(custom: { [key: string]: string | boolean }): Endpoint
    {
        for (const iterator of Object.keys(custom))
        {
            this.route.custom[iterator] = custom[iterator];
        }
        return this;
    }

    /**
    * Previous endpoint content
    * @param handler endpoint content
    * @returns 
    */
    public handler(middleware: (env: AppEnvironment) => RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>): Endpoint
    {
        this._handlers.push(middleware);
        return this;
    }
}