import { AppEnvironment } from "../AppEnvironment.js";

export interface IService
{
    init(environment: AppEnvironment): IService;
}