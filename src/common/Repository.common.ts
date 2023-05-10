import { AppEnvironment } from "../AppEnvironment.js";
import { IConfigHost } from "../interfaces/IConfigHost.interface.js";
import { IRepository } from "../interfaces/IRepository.interface.js";
import { Logger } from "./Logger.common.js";

export class Repository implements IRepository
{
    protected _cfg: IConfigHost;
    protected _logger: Logger;

    public constructor(cfg: IConfigHost, logger: Logger)
    {
        this._cfg = cfg;
        this._logger = logger;
    }   
}