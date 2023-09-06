import { AppEnvironment } from "../AppEnvironment.js";
import { IConfigHost } from "../interfaces/IConfigHost.interface.js";
import { IRepository } from "../interfaces/IRepository.interface.js";
import { Logger } from "./Logger.common.js";

export class Repository implements IRepository
{
    protected _env: AppEnvironment;

    public constructor(env: AppEnvironment)
    {
        this._env = env;
    }   
}