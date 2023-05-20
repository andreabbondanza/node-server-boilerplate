import { GenericModel } from "./Generic.model.js";

export class Auth extends GenericModel
{
    public Id: number = 0;
    public Name: string = "";
    public Surname: string = "";
    public Email: string = "";
    public Password: string = "";
    public Role: Roles = "admin";
    public SaltRefresh: number = 0;
}

export type Roles = "admin" | "customer" | "public";

export class AuthToken
{
    id: number = 0;
    name: string = "";
    role: Roles = "public";
    exp: number = 0;
}