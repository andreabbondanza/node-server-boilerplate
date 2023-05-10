import { IConfigDb } from "./IConfigDb.interface.js";
import { IConfigEmail } from "./IConfigMail.interface.js";

export interface IConfigHost
{
    server: { host: string, port: number }[];
    db: IConfigDb;
    app: { secret: string, name: string, baseApiPath: string, apikey: string };
    encryption: { algorithm: string, encoding: any };
    email: IConfigEmail;
}