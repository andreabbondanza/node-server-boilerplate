import { Express, RequestHandler } from "express";
import { ParsedQs } from "qs";
import { Route } from "./Routes.common";
import { ParamsDictionary } from "express-serve-static-core";


export class Endpoint
{
    private server: Express;
    private _handlers: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[] = [];
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
    public constructor(server: Express, route: Route)
    {
        this._route = route;
        this.server = server;
    }
    /**
     * Endpoint content
     * @param endpoint endpoint content
     * @returns 
     */
    public endpoint(endpoint: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>): Endpoint
    {
        this.server[this._route.method](this._route.path, endpoint);
        return this;
    }

    /**
    * Previous endpoint content
    * @param handler endpoint content
    * @returns 
    */
    public handler(middleware: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>): Endpoint
    {
        this._handlers.push(middleware);
        return this;
    }
}