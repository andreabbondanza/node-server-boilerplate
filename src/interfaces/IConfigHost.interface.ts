import { IConfigDb } from "./IConfigDb.interface";
import { IConfigEmail } from "./IConfigMail";

export interface IConfigHost
{
    server: { host: string, port: number };
    db: IConfigDb;
    app: { secret: string, name: string };
    encryption: { algorithm: string, encoding: any };
    email: IConfigEmail;
}