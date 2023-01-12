import { IController } from "../interfaces/IController.interface";
import { IRouteIndex } from "../interfaces/IRouteIndex.interfaces";
import { IStandardResponse, StandardResponseOptions } from "../interfaces/IStandardResponse.interface";
import { _IS_DEVELOPMENT_ } from "./Globals.common";
import { Method, Route } from "./Routes.common";

/**
 * Ritorna la lista dei metodi di un controller (solo quelli che non iniziano con _)
 * @param routes l'elenco delle routes
 * @param path la path in ingress
 * @returns ritorna null se non la trova, l'oggetto altrimenti
 */
export function getMethods(controller: IController)
{
  const obj: any = controller;
  return Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).where(
    (name) => name !== "constructor" && typeof (obj[name]) === "function" && !name.startsWith("_"))
}
/**
 * Ritorna la route in base alla path
 * @param routes l'elenco delle routes
 * @param path la path in ingress
 * @returns ritorna null se non la trova, l'oggetto altrimenti
 */
export function getRoute(routes: IRouteIndex, path: string, method: string): Route | null
{
  const keys = Object.keys(routes);
  for (const iterator of keys)
  {
    if (routes[iterator].test.test(path) && routes[iterator].method.toLocaleLowerCase() as Method !== method)
      return routes[iterator];
  }
  return null;
}
/**
 * Inizializza standard response vuota
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

export const REGEX_EMAIL = /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/;
export const REGEX_PASS = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;