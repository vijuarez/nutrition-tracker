import Express from "express"
import { dayEntryService } from "../services/day-entry-service"
import { z } from "zod"
import status from "http-status"
import { dayService } from "../services/day-service"
import { logZodError } from "../utils"


const router = Express.Router()



router.get("/:date", async (req, res) => {

    const { date } = req.params

    const day = await dayService.getDay(date)

    if (!day) {
        res.status(status.NOT_FOUND).json({
            message: "No day found for " + date,
        })
        return
    }

    const entries = await dayEntryService.getEntriesByDate(date)

    res.json({
        ...day,
        entries,
    })
})



const putDaySchema = z.object({
    raw: z.string(),
    complete: z.boolean(),
    workout_calories: z.number(),
    workout_note: z.string(),
    entries: z.array(z.object({
        // date: z.string(),
        calories: z.number(),
        food_id: z.string().nullable(),
        raw: z.string(),
        sort: z.number(),
        calories_100g: z.number().nullable(),
        foodname: z.string().nullable(),
        grams: z.number().nullable(),
        override_calories: z.number().nullable(),
        override_calories_100g: z.number().nullable(),
    }))
})

router.put("/:date", async (req, res) => {

    const { date } = req.params

    const bodyParseResult = putDaySchema.safeParse(req.body)

    if (bodyParseResult.error) {
        logZodError(bodyParseResult.error)
        res.status(status.BAD_REQUEST).json({ error: bodyParseResult.error })
        return
    }

    const { raw, complete, workout_calories, workout_note } = bodyParseResult.data
    await dayService.upsertDay(date, raw, complete, workout_calories, workout_note)
    const replacedEntries = await dayEntryService.replaceEntriesByDate(date, bodyParseResult.data.entries)

    const newDayValues = {
        date,
        raw,
        complete,
        entries: replacedEntries,
    }

    res.status(status.CREATED).json(newDayValues)
})


export const dayRouter = router