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

type DaySummary = {
    date: string
    total_calories: number
    workout_calories: number | null
}

async function getDaysByMonth(year: number, month: number): Promise<DaySummary[]> {
    // Create date range for the month (YYYY-MM-DD format)
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`

    const days = await db
        .selectFrom("day")
        .leftJoin("day_entry", "day_entry.date", "day.date")
        .select([
            "day.date",
            "day.workout_calories",
        ])
        .select((eb) => eb.fn.sum("day_entry.calories").as("total_calories"))
        .where("day.date", ">=", startDate)
        .where("day.date", "<=", endDate)
        .groupBy("day.date")
        .execute()

    return days.map(day => ({
        date: day.date,
        total_calories: Number(day.total_calories) || 0,
        workout_calories: day.workout_calories,
    }))
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
    getDaysByMonth,
}