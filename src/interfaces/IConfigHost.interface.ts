import { IConfigDb } from "./IConfigDb.interface";
import { IConfigEmail } from "./IConfigMail.interface";

export interface IConfigHost
{
    server: { host: string, port: number };
    db: IConfigDb;
    app: { secret: string, name: string, baseApiPath: string };
    encryption: { algorithm: string, encoding: any };
    email: IConfigEmail;
}