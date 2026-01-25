import type { DayEntry, Food, Day as DayBackend } from "./types.backend"
import { z } from "zod"

export type User = {
    id: string
    username: string
    created_on: number
    updated_on: number
}

export type Day = Omit<DayBackend, "complete"> & {
    complete: boolean
    entries: Omit<DayEntry, "date" | "id">[]
}

export type ParsedLineWithFoods = {
    foods: Food[]
    currentFood: Food | null

    raw: string
    foodName: string | null
    grams: number | null
    override_cal: number | null
    override_cal_100g: number | null
    sort: number
}


export type Macros = {
    calories: number,
    carbs: number,
    protein: number,
    fats: number,
    fiber: number,
}

export type ParsedLineWithMacros = ParsedLineWithFoods & {
    macros: Macros
}

export const settingsSchema = z.object({
    id: z.number(),
    target_calories: z.number().nullable(),
    target_carbs: z.number().nullable(),
    target_protein: z.number().nullable(),
    target_fats: z.number().nullable(),
    target_fiber: z.number().nullable(),
})

export type Settings = z.infer<typeof settingsSchema>

export interface SourceConfigField {
    key: string;
    label: string;
    type: 'text' | 'password';
}

export interface FoodSource {
    id: string;
    name: string;
    description: string;
    fields: SourceConfigField[];
    isReady: boolean;
}

export interface SourceSearchResult {
    id: string;
    name: string;
    calories: number;
    carbs: number;
    protein: number;
    fats: number;
    fiber: number;
}
