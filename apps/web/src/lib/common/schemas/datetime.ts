import {z} from "zod";
import {DateTime} from "luxon";


const jsDateToDateTimeSchema = z.date().transform(d => DateTime.fromJSDate(d));


const stringDateToDateTimeSchema = z.string().transform(d => DateTime.fromISO(d));

const dateTimeSchema = z.custom<DateTime<true>>(v => v instanceof DateTime);


export const coerceDateTimeSchema: z.ZodSchema<DateTime<true>, z.ZodTypeDef, Date | string | DateTime> = z.union([
    jsDateToDateTimeSchema,
    stringDateToDateTimeSchema,
    dateTimeSchema,
]).transform((dt, ctx) => {
    if (!dt.isValid) {
        ctx.addIssue({
            code: z.ZodIssueCode.invalid_date,
        });
        return z.NEVER;
    }
    return dt;
});
