import { AppEnvironment } from "../AppEnvironment";
import { ErrorServiceInit } from "../errors/ErrorServiceInit.error";
import { IService } from "../interfaces/IService.interface";
import { MYSqlRepository } from "../repositories/MySqlRepository.repository";
import { Logger } from "../common/Logger.common";
import { FileRepository } from "../repositories/FileRepository.repository";
import { IRepository } from "../interfaces/IRepository";

export class Service implements IService
{
    private _log: Logger | null = null;
    private _env: AppEnvironment | null = null;

    protected get log(): Logger
    {
        if (this._log) return this._log;
        else throw new ErrorServiceInit();
    }

    protected get env(): AppEnvironment
    {
        if (this._env) return this._env;
        else throw new ErrorServiceInit();
    }

    public init(env: AppEnvironment): Service
    {
        this._env = env;
        this._log = env.logger;
        return this;
    }

    public getRepository<T extends IRepository>(key: string): T
    {
        return this._env?.getRepository<T>(key) as T;
    }
}