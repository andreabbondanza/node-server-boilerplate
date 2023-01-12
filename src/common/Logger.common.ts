import { DateTime } from "luxon";
import { _IS_DEVELOPMENT_ } from "../common/Globals.common";
import { appendFileSync } from "fs";
import { ILogger } from "../interfaces/ILogger.interface";
import clc from "cli-color";
export class Logger implements ILogger
{
    public IS_DEBUG: boolean;
    public constructor()
    {
        this.IS_DEBUG = _IS_DEVELOPMENT_;
    }

    private _dateTime(): string
    {
        return DateTime.now().toString();
    }
    public fileLog(text: string)
    {
        this.log(text);
        appendFileSync("LOG-" + DateTime.now().toString().split("T")[0] + ".log", this._dateTime() + ": " + text + "\n", { encoding: "utf-8" });
    }

    public debug(text: string)
    {
        if (this.IS_DEBUG)
            console.log(text);
    }

    public log(text: string)
    {
        console.log(text);
    }

    public info(text: string)
    {
        console.info(clc.blue.bold("INFO: ") + text)
    }

    public warn(text: string)
    {
        console.warn(clc.yellow.bold("WARNING: ") + text)
    }
    public err(text: string)
    {
        console.error(clc.red.bold("ERROR: ") + text);
    }

    public evidence(text: string)
    {
        return clc.bold.italic.underline(text);
    }

    public tab(n: number = 1)
    {
        const res: string[] = [];
        for (let i = 0; i < n; i++)
        {
            res.push("\t");
        }
        return res.join("");
    }
}