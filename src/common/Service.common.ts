import { AppEnvironment } from "../AppEnvironment";
import { ErrorServiceInit } from "../errors/ErrorServiceInit.error";
import { IController } from "../interfaces/IController.interface";
import { IService } from "../interfaces/IService.interface";
import { MYSqlService } from "../services/MYSqlService.service";
import { Logger } from "../common/Logger.common";
import { FileService } from "../services/FileService.service";

export class Service implements IService
{
    private _db: MYSqlService | null = null;
    private _fs: FileService | null = null;
    private _log: Logger | null = null;
    private _env: AppEnvironment | null = null;
    protected get db(): MYSqlService
    {
        if (this._db) return this._db;
        else throw new ErrorServiceInit();
    }
    protected get fs(): FileService
    {
        if (this._fs) return this._fs;
        else throw new ErrorServiceInit();
    }
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
    public init(controller: IController): Service
    {
        this._db = controller.dbService;
        this._fs = controller.fileService;
        this._env = controller.env;
        this._log = controller.env.logger;

        return this;
    }
}