import {z} from "zod";
import {DateTime} from "luxon";


export const ToDateTime = z.union([
    z.string().transform(s => DateTime.fromISO(s)),
    z.date().transform(s => DateTime.fromJSDate(s))
]);