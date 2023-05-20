import { Service } from "../common/Service.common.js";
import { Auth } from "../models/Auth.model.js";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

import { DateTime } from 'luxon';
import { IAuthToken } from '../interfaces/IAuthToken.interface.js';
import { IRefreshToken } from '../interfaces/IRefreshToken.interface.js';
import { LoginResponse } from "../models/LoginResponse.model.js";
import { MYSqlRepository } from "../repositories/MySqlRepository.repository.js";

export class AuthService extends Service
{

    /**
     * NOTE: generate token and refresh token
     * @param user user
     * @param secret secret
     * @returns couple of token
     */
    public tokenGeneration(user: Auth, secret: string): LoginResponse
    {
        const {sign} = jwt;
        const _tokenExpDays: number = this.env.isDev ? 500 : 3;
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
    /**
     * Check if user and password are correct and return the user
     * @param mail email
     * @param pwd password
     * @returns user or null if not found
     */
    public async login(mail: string, pwd: string): Promise<Auth | null>
    {
        const db = this.env.getRepository<MYSqlRepository>("MYSqlRepository");
        const rows = await db.select<Auth>("Auth", [["Email", "=", mail], ["Password", "=", pwd]]);
        this.log.debug(JSON.stringify(rows));
        if (rows.length > 0) return rows[0];
        return null;
    }
    /**
     * return user by id
     * @param id 
     * @returns user or null if not found
     */
    public async getAuth(id: number): Promise<Auth | null>
    {
        const db = this.env.getRepository<MYSqlRepository>("MYSqlRepository");
        const rows = await db.select<Auth>("Auth", ["Id", "=", id]);
        if (rows.length > 0) return rows[0];
        return null;
    }
    /**
     * return user by email
     * @param mail email
     * @returns user or null if not found
     */
    public async getAuthByEmail(mail: string): Promise<Auth | null>
    {
        const db = this.env.getRepository<MYSqlRepository>("MYSqlRepository");
        const rows = await db.select<Auth>("Auth", ["Email", "=", mail]);
        if (rows.length > 0) return rows[0];
        return null;
    }
    /**
     * update user password
     * @param id  id of user
     * @param pwd  new password
     * @returns  true if ok, false if not
     */
    public async updatePassword(id: number, pwd: string): Promise<boolean | null>
    {
        const db = this.env.getRepository<MYSqlRepository>("MYSqlRepository");
        const response = await db.update<Auth>([["Password", pwd]], ["Id", "=", id], "Auth");
        if (response)
        {
            return true;
        }
        return false;
    }
    /**
     * add new user
     * @param user
     * @returns id of new user or null if not found
     */
    public async createUser(user: Auth): Promise<number | null>
    {
        const db = this.env.getRepository<MYSqlRepository>("MYSqlRepository");
        const response = await db.insert<Auth>(user, "Auth");
        if (response)
        {
            return response;
        }
        return null;
    }
}