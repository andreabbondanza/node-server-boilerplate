
export interface IRefreshToken
{
    data: { id: number, ts: number };
    exp: number;
    salt: number;
}