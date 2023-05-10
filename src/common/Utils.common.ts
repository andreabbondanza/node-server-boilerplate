import { IController } from "../interfaces/IController.interface.js";
import { IRouteIndex } from "../interfaces/IRouteIndex.interface.js";
import { IStandardResponse, StandardResponseOptions } from "../interfaces/IStandardResponse.interface.js";
import { Method } from "./Methods.common.js";
import { Route } from "./Routes.common.js";

/**
 * Return all the methods of a controller (except the constructor and the ones that start with _)
 * @param controller the controller
 */
export function getMethods(controller: IController)
{
  const obj: any = controller;
  return Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).where(
    (name) => name !== "constructor" && typeof (obj[name]) === "function" && !name.startsWith("_"))
}
/**
 * Returns the route object from the path and the method
 * @param routes routes index from environment
 * @param path the input path (from the request)
 * @param method the input method (from the request)
 * @returns return null if the route is not found, otherwise the route object
 */
export function getRoute(routes: IRouteIndex, path: string, method: string): Route | null
{
  const keys = Object.keys(routes);
  for (const iterator of keys)
  {
    if (routes[iterator].test.test(path) && routes[iterator].method.toLocaleLowerCase() as Method === method.toLocaleLowerCase())
      return routes[iterator];
  }
  return null;
}
/**
 * Init an empty StandardResponse
 * @param data standard response
 * @returns 
 */
export function initSR<T>(data: StandardResponseOptions = { Data: "", Message: "", Error: { Num: 0, Desc: "" } }): IStandardResponse<T>
{

  const d = data as any;
  if (d["Data"] === undefined) d["Data"] = "";
  if (d["Error"] === undefined) d["Error"] = { Num: 0, Desc: "" };
  if (d["Message"] === undefined) d["Message"] = "";
  return d;
}

/**
 * Escape for regexp
 * @param string input string
 * @returns escaped string
 */
export function escapeRegExp(string: string)
{
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const REGEX_EMAIL = /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/;
export const REGEX_PASS = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;