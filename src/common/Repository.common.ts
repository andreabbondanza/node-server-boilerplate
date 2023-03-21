import { AppEnvironment } from "../AppEnvironment";
import { IConfigHost } from "../interfaces/IConfigHost.interface";
import { IRepository } from "../interfaces/IRepository";
import { Logger } from "./Logger.common";

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