export interface IStandardResponse<T>
{
    Message: string;
    Data: T;
    Error: { Num: number; Desc: string; }
}

export type StandardResponseOptions =
    { Message: string, Error: { Desc: string, Num: number } } |
    { Message: string } |
    { Message: string, Data: any, Error: { Desc: string, Num: number } } |
    { Message: string, Data: any }; 