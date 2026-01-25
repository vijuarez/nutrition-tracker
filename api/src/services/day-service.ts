import { db } from "../db/db"
import { DayDTO } from "../types"


async function getDay(date: string): Promise<DayDTO | undefined> {
    const values = await db
        .selectFrom("day")
        .selectAll()
        .where("date", "=", date)
        .executeTakeFirst()

    if (!values)
        return undefined

    return {
        ...values,
        complete: !!values?.complete,
    }
}

async function upsertDay(date: string, raw: string, complete: boolean, workout_calories: number | null, workout_note: string | null): Promise<void> {

    const values = {
        date,
        raw,
        complete: complete ? 1 : 0,
        workout_calories,
        workout_note,
    }

    const rows = await db
        .insertInto("day")
        .values(values)
        .onConflict(x => x.doUpdateSet(values))
        .execute()

    // const ok = rows.length > 0
    // return ok ? values : null
}


export const dayService = {
    getDay,
    upsertDay,
}