import { AppEnvironment } from "../AppEnvironment";

export interface IService
{
    init(environment: AppEnvironment): IService;
}