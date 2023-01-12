import { DateTime } from "luxon";


export class GenericModel extends Object
{
    public Created: string = DateTime.now().toISO({
        includeOffset: false
    });
    public Updated: string = DateTime.now().toISO({
        includeOffset: false,
    });
}