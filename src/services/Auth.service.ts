import { Service } from "../common/Service.common"
import { Auth, Roles } from "../shared/Auth.model";
import { sign } from 'jsonwebtoken';
import { DateTime } from 'luxon';
import { _IS_DEVELOPMENT_ } from '../common/Globals.common';
import { IAuthToken } from '../interfaces/IAuthToken.interface';
import { IRefreshToken } from '../interfaces/IRefreshToken.interface';
import { LoginResponse } from "../shared/LoginResponse.model";

export class AuthService extends Service
{

    /**
     * NOTA: Genera la coppia di token
     * @param user utente radice
     * @param secret secret
     * @returns coppia
     */
    public tokenGeneration(user: Auth, secret: string): LoginResponse
    {
        const _tokenExpDays: number = _IS_DEVELOPMENT_ ? 500 : 3;
        const data: IAuthToken = {
            id: user.Id,
            name: user.Name + " " + user.Surname,
            role: user.Role,
            exp: DateTime.now().plus({ days: _tokenExpDays }).toMillis()
        }
        const auth_token = sign(data, secret, { algorithm: "HS512" });
        const rdata: IRefreshToken = {
            data: { id: user.Id, ts: DateTime.now().toMillis() },
            salt: user.SaltRefresh,
            exp: DateTime.now().plus({ days: _tokenExpDays * 10 }).toMillis()
        }
        const refresh_token = sign(rdata, secret, { algorithm: "HS512" });
        return { auth_token, refresh_token };
    }

    public async login(mail: string, pwd: string): Promise<Auth | null>
    {
        const rows = await this.db.select<Auth>("Auth", [["Email", "=", mail], ["Password", "=", pwd]]);
        this.log.debug(JSON.stringify(rows));
        if (rows.length > 0) return rows[0];
        return null;
    }
    public async getAuth(id: number): Promise<Auth | null>
    {
        const rows = await this.db.select<Auth>("Auth", ["Id", "=", id]);
        if (rows.length > 0) return rows[0];
        return null;
    }

    public async getAuthByEmail(mail: string): Promise<Auth | null>
    {
        const rows = await this.db.select<Auth>("Auth", ["Email", "=", mail]);
        if (rows.length > 0) return rows[0];
        return null;
    }

    public async updateAuthPassword(auth: Auth, pwd: string): Promise<Auth | null>
    {
        auth.Password = pwd;
        const toUpdate = this.db.getSetValues<Auth>(auth);
        const response = await this.db.update<Auth>(toUpdate, ["Id", "=", auth.Id], "Auth");
        if (response)
        {
            return auth;
        }
        return null;
    }

    public async createUser(user: Auth): Promise<number | null>
    {
        const response = await this.db.insert<Auth>(user, "Auth");
        if (response)
        {
            return response;
        }
        return null;
    }
}