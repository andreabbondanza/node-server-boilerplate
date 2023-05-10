import { IRouteIndex } from "../interfaces/IRouteIndex.interface.js";
import { Roles } from "../model/Auth.model.js";
import { Method } from "./Methods.common.js";

export const Routes: IRouteIndex = {};

export class Route
{
    /**
     * Routing path
     */
    public readonly path: string;
    /**
     * Endpoint roles
     */
    public readonly roles: Roles[];
    /**
     * Routing regex test
     */
    public readonly test: RegExp;
    /**
     * Custom data for the route
     */
    public readonly custom: { [key: string]: string | boolean };
    /**
     * Routing method
     */
    public readonly method: Method;
    /**
     * Create routing
     * @param path Path
     * @param roles roles
     * @param test regex
     * @param method method
     * @param custom custom data
     * @returns routing object
     */
    public constructor(path: string, roles: Roles[], test: RegExp, method: Method = "get", custom = {})
    {
        this.path = path;
        this.roles = roles;
        this.test = test;
        this.method = method;
        this.custom = custom;
    }

}
