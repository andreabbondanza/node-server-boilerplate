import { IRouteIndex } from "../interfaces/IRouteIndex.interfaces";
import { Roles } from "../shared/Auth.model";

export const Routes: IRouteIndex = {};

export type Method = "post" | "put" | "patch" | "get" | "delete";

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
     * Routing method
     */
    public readonly method: Method;
    /**
         * Create routing
         * @param path Path
         * @param roles roles
         * @param test regex
         * @param method method
         * @returns routing object
         */
    public constructor(path: string, roles: Roles[], test: RegExp, method: Method = "get")
    {
        this.path = path;
        this.roles = roles;
        this.test = test;
        this.method = method;
    }

}
