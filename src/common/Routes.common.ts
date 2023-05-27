import { IPath } from "../interfaces/IPath.interface.js";
import { IRouteIndex } from "../interfaces/IRouteIndex.interface.js";
import { Roles } from "../models/Auth.model.js";
import { Method } from "./Methods.common.js";
import crypto from "crypto";

export const Routes: IRouteIndex = {};

export class Route
{
    /**
     * Routing path
     */
    public readonly paths: IPath[];
    /**
     * Endpoint roles
     */
    public readonly roles: Roles[];
    /**
     * Custom data for the route
     */
    public readonly custom: { [key: string]: string | boolean };
    /**
     * Return hash of the paths for the routing registration
     */
    public get hash(): string
    {
        const hash = crypto.createHash('sha256').update(this.paths.map(x => x.path).join("-")).digest('hex');
        return hash.substring(0, 64);
    }
    /**
     * Test if one of the paths matches the route
     * @param path path to test
     * @returns true if one of the paths matches the route
     */
    public test(path: string): boolean
    {
        for (const iterator of this.paths)
        {
            if (iterator.test.test(path))
                return true;
        }
        return false;
    }
    /**
     * Routing method
     */
    public readonly method: Method;
    /**
     * Create routing
     * @param paths Path
     * @param roles roles
     * @param test regex
     * @param method method
     * @param custom custom data
     * @returns routing object
     */
    public constructor(paths: IPath[], roles: Roles[], method: Method = "get", custom = {})
    {
        this.paths = paths;
        this.roles = roles;
        this.method = method;
        this.custom = custom;
    }

}
