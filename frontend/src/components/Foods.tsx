import s from "./Foods.module.scss"

import { useFoods } from "../hooks/useFoods"
import { useSources } from "../hooks/useSources"
import { useMemo, useState } from "react"
import z from "zod"
import Button from "./Button"
import { FaArrowDown, FaArrowUp, FaEdit, FaSearch, FaTrash } from "react-icons/fa"
import Table from "./Table"
import type { Food } from "../types.backend"
import type { SourceSearchResult } from "../types"
import dayjs from "dayjs"

type Props = {

}

export default function Foods({ }: Props) {

    const { allFoods, addFood, deleteFood, updateFood } = useFoods()
    const { sources, saveConfig, searchRemote, isSearching } = useSources()

    const [foodName, setFoodName] = useState("")
    const [foodCalories, setFoodCalories] = useState("")
    const [foodCarbs, setFoodCarbs] = useState("")
    const [foodProtein, setFoodProtein] = useState("")
    const [foodFats, setFoodFats] = useState("")
    const [foodFiber, setFoodFiber] = useState("")

    const [remoteSearchResults, setRemoteSearchResults] = useState<SourceSearchResult[]>([])
    const [showRemoteSearch, setShowRemoteSearch] = useState(false)

    const [sourceConfigs, setSourceConfigs] = useState<Record<string, Record<string, string>>>({})

    const [error, setError] = useState<any>(null)

    const [sortBy, setSortBy] = useState<"name" | "date">("date")
    const [sortAsc, setSortAsc] = useState(true)

    function sortFoods(a: Food, b: Food): number {
        if (sortBy === "name")
            return (a.name < b.name ? -1 : 1)
        else
            return (a.added_on < b.added_on ? -1 : 1)
    }

    const sortedFoods = useMemo(() => {
        const foods = allFoods.sort(sortFoods)
        if (sortAsc)
            return foods
        return [...foods].reverse()
    }, [allFoods, sortBy, sortAsc, sortFoods])

    const newFoodSchema = z.object({
        name: z.string().min(3),
        calories: z.coerce.number().default(0),
        carbs: z.coerce.number().default(0),
        protein: z.coerce.number().default(0),
        fats: z.coerce.number().default(0),
        fiber: z.coerce.number().default(0),
    })

    async function onSubmit() {

        const validationResult = newFoodSchema.safeParse({
            name: foodName,
            calories: foodCalories,
            protein: foodProtein,
            fats: foodFats,
            fiber: foodFiber,
            carbs: foodCarbs,
        })

        if (validationResult.error) {
            setError(validationResult.error)
            return
        }

        const result = await addFood({
            ...validationResult.data,
            added_on: dayjs().format("YYYY-MM-DD"),
        })
        setError(null)
        console.log("Created foods:", result)
        setFoodName("")
        setFoodCalories("")
        setFoodCarbs("")
        setFoodProtein("")
        setFoodFats("")
        setFoodFiber("")
    }

    async function onSearchRemote() {
        if (!foodName) return
        setShowRemoteSearch(true)
        try {
            const results = await searchRemote(foodName)
            setRemoteSearchResults(results)
        } catch (e) {
            console.error(e)
        }
    }

    function onSelectRemoteResult(result: SourceSearchResult) {
        setFoodName(result.name)
        setFoodCalories(result.calories.toString())
        setFoodCarbs(result.carbs.toString())
        setFoodProtein(result.protein.toString())
        setFoodFats(result.fats.toString())
        setFoodFiber(result.fiber.toString())
        setShowRemoteSearch(false)
    }

    const [showEditModal, setShowEditModal] = useState(false)
    const [foodToEdit, setFoodToEdit] = useState<Food>({
        calories: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        protein: 0,
        name: "",
        added_on: "",
        id: "",
    })

    function editFood(food: Food) {
        setShowEditModal(true)
        setFoodToEdit({ ...food })
    }

    async function onConfirmEditFood() {
        try {
            await updateFood(foodToEdit)
            setShowEditModal(false)
        }
        catch (error) {
            console.error(error)
        }
    }

    return (
        <div className={s.Foods}>

            {/* Edit food modal */}
            <div className={s.edit_food_modal} data-show={showEditModal}>
                <form>
                    <header>Edit food: {foodToEdit.name}</header>
                    <section>
                        <label>Name<input type="text" value={foodToEdit.name} onChange={e => setFoodToEdit({ ...foodToEdit, name: e.target.value })} /></label>
                        <label>Calories<input type="number" value={foodToEdit.calories} onChange={e => setFoodToEdit({ ...foodToEdit, calories: e.target.valueAsNumber })} min={0} /></label>
                        <label>Carbs<input type="number" value={foodToEdit.carbs} onChange={e => setFoodToEdit({ ...foodToEdit, carbs: e.target.valueAsNumber })} min={0} /></label>
                        <label>Protein<input type="number" value={foodToEdit.protein} onChange={e => setFoodToEdit({ ...foodToEdit, protein: e.target.valueAsNumber })} min={0} /></label>
                        <label>Fats<input type="number" value={foodToEdit.fats} onChange={e => setFoodToEdit({ ...foodToEdit, fats: e.target.valueAsNumber })} min={0} /></label>
                        <label>Fiber<input type="number" value={foodToEdit.fiber} onChange={e => setFoodToEdit({ ...foodToEdit, fiber: e.target.valueAsNumber })} min={0} /></label>
                    </section>
                    <footer>
                        <Button type="button" onClick={() => setShowEditModal(false)}>Cancel</Button>
                        <Button type="submit" onClick={e => { e.preventDefault(); onConfirmEditFood() }} disabled={foodToEdit.name.length < 3}>Update</Button>
                    </footer>
                </form>
                <div className={s.bg} onClick={() => setShowEditModal(false)} />
            </div>

            {
                allFoods.length > 0 &&
                <header>
                    {/* {allFoods.length} food{allFoods.length > 1 && "s"} */}
                    <label>
                        Sort by&nbsp;
                        <select onChange={e => setSortBy(e.target.value as typeof sortBy)}>
                            <option value="name">Name</option>
                            <option value="date">Added on</option>
                        </select>
                    </label>
                    <Button onClick={() => setSortAsc(!sortAsc)} unstyled>
                        {sortAsc ? <FaArrowUp /> : <FaArrowDown />}
                    </Button>
                </header>
            }

            {
                allFoods.length > 0 &&
                <div className={s.table_container}>
                    <Table>
                        <thead>
                            <tr>
                                {/* <th>id</th> */}
                                <th>Name</th>
                                <th>Kcal</th>
                                <th>Carbs</th>
                                <th>Protein</th>
                                <th>Fats</th>
                                <th>Fiber</th>
                                <th>Added&nbsp;on</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedFoods.map(food => (
                                <tr key={food.id}>
                                    {/* <td>{food.id}</td> */}
                                    <td>
                                        <Button type="button" unstyled onClick={() => {
                                            if (window.confirm("Delete food " + food.name + "?"))
                                                deleteFood(food.id)
                                        }}>
                                            <FaTrash size={16} />
                                        </Button>
                                        &nbsp;
                                        <Button type="button" unstyled onClick={() => editFood(food)}>
                                            <FaEdit size={16} />
                                        </Button>
                                        &nbsp;
                                        {food.name}
                                    </td>
                                    <td>{food.calories}</td>
                                    <td>{food.carbs}</td>
                                    <td>{food.protein}</td>
                                    <td>{food.fats}</td>
                                    <td>{food.fiber}</td>
                                    <td>{food.added_on}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            }

            <form onSubmit={e => { e.preventDefault(); onSubmit() }}>
                <fieldset className={s.new_food}>
                    <header>Add new food</header>
                    <label>
                        Name
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="text" value={foodName} onChange={e => setFoodName(e.target.value)} style={{ flex: 1 }} />
                            <Button type="button" onClick={onSearchRemote} disabled={!foodName || isSearching} title="Search Remote">
                                <FaSearch />
                            </Button>
                        </div>
                    </label>
                    <label>Calories<input type="text" value={foodCalories} onChange={e => setFoodCalories(e.target.value)} /></label>
                    <label>Carbs<input type="text" value={foodCarbs} onChange={e => setFoodCarbs(e.target.value)} /></label>
                    <label>Protein<input type="text" value={foodProtein} onChange={e => setFoodProtein(e.target.value)} /></label>
                    <label>Fats<input type="text" value={foodFats} onChange={e => setFoodFats(e.target.value)} /></label>
                    <label>Fiber<input type="text" value={foodFiber} onChange={e => setFoodFiber(e.target.value)} /></label>
                    <Button type="submit">Save</Button>
                </fieldset>
            </form>

            {/* Remote Search Modal */}
            <div className={s.edit_food_modal} data-show={showRemoteSearch}>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', maxWidth: '500px', width: '90%', zIndex: 100 }}>
                    <header style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Search results for "{foodName}"</header>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {isSearching && <div>Searching...</div>}
                        {!isSearching && remoteSearchResults.length === 0 && <div>No results found</div>}
                        {remoteSearchResults.map(result => (
                            <div key={result.id} onClick={() => onSelectRemoteResult(result)} style={{ padding: '0.5rem', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                                <strong>{result.name}</strong><br />
                                <small>{result.calories} kcal | C:{result.carbs} P:{result.protein} F:{result.fats}</small>
                            </div>
                        ))}
                    </div>
                    <footer style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={() => setShowRemoteSearch(false)}>Close</Button>
                    </footer>
                </div>
                <div className={s.bg} onClick={() => setShowRemoteSearch(false)} />
            </div>

            <section className={s.sources_config}>
                <header>Sources Configuration</header>
                {sources.map(source => (
                    <div key={source.id} className={s.source_item}>
                        <strong>{source.name}</strong> {source.isReady ? '✅' : '❌'}
                        <p><small>{source.description}</small></p>
                        {source.fields.map(field => (
                            <label key={field.key}>
                                {field.label}
                                <input
                                    type={field.type}
                                    value={sourceConfigs[source.id]?.[field.key] || ''}
                                    onChange={e => setSourceConfigs({
                                        ...sourceConfigs,
                                        [source.id]: {
                                            ...(sourceConfigs[source.id] || {}),
                                            [field.key]: e.target.value
                                        }
                                    })}
                                />
                            </label>
                        ))}
                        <Button onClick={() => saveConfig({ sourceId: source.id, config: sourceConfigs[source.id] || {} })}>
                            Save Config
                        </Button>
                    </div>
                ))}
            </section>

            {
                error &&
                <pre>{JSON.stringify(error, null, 4)}</pre>
            }

        </div >
    )
}
