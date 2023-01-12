import { Logger } from "../common/Logger.common";
import { DBService } from "../services/DBService.service";
import { IController } from "./IController.interface";

export interface IService
{
    init(environment: IController): IService;
}