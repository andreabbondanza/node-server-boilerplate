import { DateTime } from "luxon";


export class GenericModel extends Object
{
    public Created: DateTime = DateTime.now();
    public Updated: DateTime = DateTime.now()
}