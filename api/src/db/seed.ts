import { dayEntryService } from "../services/day-entry-service"
import { dayService } from "../services/day-service"
import { foodService } from "../services/foods-service"
import { DayDTO } from "../types"
import { DayEntry, Food } from "./schema"



type Day = DayDTO & {
    entries: Omit<DayEntry, "date">[]
}


const defaultFoods: Food[] = [
    {
        id: "choc",
        name: "chocolate",
        calories: 500,
        carbs: 20,
        fats: 50,
        protein: 20,
        fiber: 10,
        added_on: "2025-01-01",
    }
]

const defaultDays: Day[] = [
    {
        date: "2025-08-04",
        complete: false,
        raw: "10 chocolate 400",
        workout_calories: 0,
        workout_note: "",
        entries: [
            {
                raw: "10 chocolate",
                calories: 40,
                calories_100g: 500,
                grams: 10,
                override_calories_100g: null,
                food_id: "choc",
                foodname: "chocolate",
                id: "food-entry-1",
                override_calories: null,
                sort: 0,
            },
        ],
    },
]

async function seedFoods() {
    for (const food of defaultFoods) {
        await foodService.addFood(food, food.id)
    }
}

async function seedDays() {
    for (const day of defaultDays) {
        await dayService.upsertDay(day.date, day.raw, day.complete, day.workout_calories, day.workout_note)
        await dayEntryService.replaceEntriesByDate(day.date, day.entries)
    }
}

export async function seed() {
    await seedFoods()
    await seedDays()
    console.info("[OK] seed database")
}
