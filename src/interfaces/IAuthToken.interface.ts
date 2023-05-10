import { Roles } from "../model/Auth.model.js";

export interface IAuthToken
{
    id: number;
    name: string;
    role: Roles;
    exp: number;
}