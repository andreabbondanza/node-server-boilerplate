import { AppEnvironment } from "../AppEnvironment";
import { Logger } from "../common/Logger.common";

import { IConfigHost } from "../interfaces/IConfigHost.interface";

export class FileService
{
    private _cfg: IConfigHost;
    private _logger: Logger;

    public constructor(env: AppEnvironment)
    {
        this._cfg = env.configHost;
        this._logger = env.logger;
    }

}

