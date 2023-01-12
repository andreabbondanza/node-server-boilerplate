import { Roles } from "../shared/Auth.model";

export interface IAuthToken
{
    id: number;
    name: string;
    role: Roles;
    exp: number;
}