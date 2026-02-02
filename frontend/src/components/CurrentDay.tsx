import s from "./CurrentDay.module.scss"

import { useCurrentDay } from "../hooks/useCurrentDay"
import { useTextareaValueStore } from "../stores/useTextareaValueStore"
import Textareas from "./Textareas"
import { useEffect, useMemo, useState } from "react"
import { processTextareaValue } from "../utils/processTextareaValue"
import DatePicker from "./DatePicker"
import { useCurrentDate } from "../hooks/useCurrentDate"
// import type { ParsedLineWithMacros } from "../types"
import { useFoods } from "../hooks/useFoods"
import { useUser } from "../hooks/useUser"
import { sumMacros } from "../utils"
import type { Macros } from "../types"
import Button from "./Button"
import Table from "./Table"
import { FaPen, FaWalking } from "react-icons/fa"
import CalorieProgressBar from "./CalorieProgressBar"


type Props = {

}

export default function CurrentDay({ }: Props) {

    const { currentDateString } = useCurrentDate()
    const { textareaValue, setTextareaValue } = useTextareaValueStore()
    const [synced, setSynced] = useState(true)
    const { day, uploadDay, loading } = useCurrentDay(currentDateString)
    const [autoUpload, setAutoUpload] = useState(true)
    const [uploadTimeoutId, setUploadTimeoutId] = useState(-1)

    const [workoutCalories, setWorkoutCalories] = useState(0)
    const [workoutNote, setWorkoutNote] = useState("")

    const { allFoods } = useFoods()

    // const [parsedLines, setParsedLines] = useState<ParsedLineWithMacros[]>([])

    // console.log({ day, textareaValue })

    function resetInputs() {
        setTextareaValue("")
        setWorkoutCalories(0)
        setWorkoutNote("")
    }

    // Whenever the day changes, update the textarea value with the correct value
    // (if available, otherwise clear the textarea)
    useEffect(() => {
        // console.log("Date changed, loading day:", currentDateString, day)
        if (day) {
            setTextareaValue(day.raw)
            setWorkoutCalories(day.workout_calories || 0)
            setWorkoutNote(day.workout_note || "")
        }
        else
            resetInputs()

        setSynced(true)

    }, [currentDateString, day])

    const lineInfo = processTextareaValue(textareaValue)

    // console.log({ currentDateString, day, textareaValue })

    async function parseAndUpload(textareaValue: string, workoutCalories: number, workoutNote: string) {
        const lineInfo = processTextareaValue(textareaValue)
        // console.log("parseAndUpload", { textareaValue, lineInfo })
        const ok = await uploadDay({
            raw: textareaValue,
            date: currentDateString,
            complete: true,
            workout_calories: workoutCalories,
            workout_note: workoutNote,
            entries: lineInfo.linesWithMacros.map(line => ({
                calories: line.macros.calories,
                calories_100g: line.override_cal_100g || line.currentFood?.calories || null,
                food_id: line.currentFood?.id || null,
                foodname: line.currentFood?.name || null,
                raw: line.raw,
                grams: line.grams,
                override_calories_100g: line.override_cal_100g,
                override_calories: line.override_cal,
                sort: line.sort,
            }))
        })
        if (ok) {
            setSynced(true)
            setUploadTimeoutId(-1)
        }
    }

    // To add
    const showSidebar = false

    const totalCalories = useMemo(() => {
        let sum = 0
        for (const line of lineInfo.linesWithMacros)
            sum += line.macros.calories
        return sum
    }, [lineInfo.linesWithMacros])

    const [showDebug, setShowDebug] = useState(false)

    const { user } = useUser()

    function onInputChange(newTextareaValue: string, workoutCalories: number, workoutNote: string) {
        setTextareaValue(newTextareaValue)
        setWorkoutCalories(workoutCalories)
        setWorkoutNote(workoutNote)

        if (!autoUpload)
            return

        setSynced(false)
        cancelAutoUpload()
        setUploadTimeoutId(window.setTimeout(() => parseAndUpload(newTextareaValue, workoutCalories, workoutNote), 2000))
    }

    function cancelAutoUpload() {
        window.clearTimeout(uploadTimeoutId)
        setUploadTimeoutId(-1)
    }

    return (
        <div className={s.CurrentDay}>

            <DatePicker
                onDateChange={cancelAutoUpload}
                enabled={uploadTimeoutId < 0}
            />

            <header>
                <CalorieProgressBar
                    totalCalories={totalCalories}
                    workoutCalories={workoutCalories}
                    minCalories={user?.min_calories ?? null}
                    maxCalories={user?.max_calories ?? null}
                />
            </header>

            <main>

                <section>

                    <div className={s.textarea_container}>
                        <Textareas
                            loading={loading}
                            textareaValue={textareaValue}
                            onChange={(textareaValue) => onInputChange(textareaValue, workoutCalories, workoutNote)}
                            parsedLines={lineInfo.linesWithMacros}
                            showMacros={showSidebar}
                        />
                        {synced ? <small>synced ✅</small> : <small>not synced ❌</small>}
                    </div>

                    {/* <pre>{JSON.stringify({ uploadTimeoutId })}</pre> */}

                    {
                        import.meta.env.DEV &&
                        <footer className={s.debug}>
                            <Button onClick={() => parseAndUpload(textareaValue, workoutCalories, workoutNote)} disabled={synced}>Upload day</Button>

                            <label>
                                <input type="checkbox" checked={autoUpload} onChange={() => setAutoUpload(!autoUpload)} />
                                Auto upload day
                            </label>

                            {/* Debug */}
                            {
                                import.meta.env.DEV &&
                                <label style={{ marginLeft: "auto" }}>
                                    <input type="checkbox" checked={showDebug} onChange={() => setShowDebug(!showDebug)} />
                                    Show debug
                                </label>
                            }
                        </footer>
                    }

                    <fieldset className={s.workouts}>
                        {/* <legend>Workouts</legend> */}
                        <label>
                            <span><FaWalking size={16} /> Workout calories</span>
                            <input
                                type="number"
                                value={workoutCalories}
                                onChange={e => {
                                    onInputChange(textareaValue, e.target.valueAsNumber, workoutNote)
                                }}
                            />
                        </label>
                        <label>
                            <span><FaPen size={14} /> Workout note</span>
                            <textarea
                                value={workoutNote}
                                onChange={e => {
                                    onInputChange(textareaValue, workoutCalories, e.target.value)
                                }}
                            />
                        </label>
                    </fieldset>

                </section>

                {/* <h2>Total macros</h2>
            <pre>{JSON.stringify(sumMacros(lineInfo.linesWithMacros.map(line => line.macros)), null, 4)}</pre> */}

                {/* <h2>Macros per food</h2>
            <pre>{JSON.stringify(lineInfo.linesWithMacros.map(line => ({
                food: line.foodName,
                macros: line.macros,
            })), null, 4)}</pre> */}

                <section>
                    <div className={s.table_container}>
                        {
                            lineInfo.linesWithMacros.length > 0 &&
                            <MacrosTable foods={lineInfo.linesWithMacros.filter(line => line.foodName)} />
                        }
                    </div>
                </section>

            </main>

            {
                import.meta.env.DEV &&
                showDebug &&
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                    <pre style={{ border: "1px solid gray", padding: 10 }}>{JSON.stringify({ allFoods, lineInfo }, null, 4)}</pre>
                    <pre style={{ border: "1px solid gray", padding: 10 }}>{JSON.stringify(day, null, 4)}</pre>
                </div>
            }

        </div>
    )
}

/*
function TestSearch() {

    const [input, setInput] = useState("")
    const results = fuseSearch.search(input)

    return (
        <div>
            <h2>Test search</h2>
            <input type="text" value={input} onChange={e => setInput(e.target.value)} />
            <pre>{JSON.stringify(results, null, 4)}</pre>
        </div>
    )
}
*/


type MacrosTableProps = {
    foods: {
        foodName: string | null
        macros: Macros
    }[]
}

function MacrosTable({ foods }: MacrosTableProps) {

    const totalMacros = useMemo(() => sumMacros(foods.map(food => food.macros)), [foods])

    return (
        <Table>
            <thead>
                <tr>
                    <th>Food</th>
                    <th>Kcal</th>
                    <th>Carbs</th>
                    <th>Protein</th>
                    <th>Fats</th>
                    <th>Fiber</th>
                </tr>
            </thead>
            <tbody>
                {
                    foods.map((food, i) => (
                        <tr key={i}>
                            <td>{food.foodName}</td>
                            <td>{food.macros.calories.toFixed()}</td>
                            <td>{food.macros.carbs.toFixed()}</td>
                            <td>{food.macros.protein.toFixed()}</td>
                            <td>{food.macros.fats.toFixed()}</td>
                            <td>{food.macros.fiber.toFixed()}</td>
                        </tr>
                    ))
                }
            </tbody>
            <tfoot>
                <tr>
                    <td>Total</td>
                    <td>{totalMacros.calories.toFixed()}</td>
                    <td>{totalMacros.carbs.toFixed()}</td>
                    <td>{totalMacros.protein.toFixed()}</td>
                    <td>{totalMacros.fats.toFixed()}</td>
                    <td>{totalMacros.fiber.toFixed()}</td>
                </tr>
            </tfoot>
        </Table>
    )
}