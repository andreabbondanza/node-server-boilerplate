export interface IStandardResponse<T>
{
    message: string;
    data: T;
    error: { num: number; desc: string; }
}

export type StandardResponseOptions =
    { message: string, error: { desc: string, num: number } } |
    { message: string } |
    { message: string, data: any, error: { error: string, num: number } } |
    { message: string, data: any }; 