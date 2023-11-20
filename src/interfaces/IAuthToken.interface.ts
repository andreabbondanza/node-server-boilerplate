import { Roles } from "../models/Auth.model.js";

export interface IAuthToken
{
    id: number;
    name: string;
    salt: number;
    role: Roles;
    exp: number;
}