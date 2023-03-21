import process from "process";

let debug = false;

for (const arg of process.argv)
{
    if (arg.split("=").length > 1) 
    {
        if (arg.split("=")[0].toLowerCase() === "debug")
        {
            debug = Number.parseInt(arg.split("=")[1]) > 0 ? true : false;
        }
    }
}

export const _IS_DEVELOPMENT_: boolean = debug;

export type _DB_TABLES_ = "Auth" | "OtherTable";