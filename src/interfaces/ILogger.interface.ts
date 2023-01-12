export interface ILogger
{
    fileLog(text: string): void;
    log(text: string): void;
    info(text: string): void;
    warn(text: string): void;
    warn(err: string): void;
    debug(err: string): void;
    readonly IS_DEBUG: boolean;
}

