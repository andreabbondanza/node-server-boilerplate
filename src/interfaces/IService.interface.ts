import { IController } from "./IController.interface";

export interface IService
{
    init(environment: IController): IService;
}