import Express from "express"
import { z } from "zod"
import { foodService } from "../services/foods-service"
import status from "http-status"
import { userGuardMiddleware } from "../middleware/user-guard-middleware"
import { logZodError } from "../utils"

const router = Express.Router()

router.use(userGuardMiddleware)

const foodSchema = z.object({
    name: z.string(),
    calories: z.coerce.number(),
    carbs: z.coerce.number(),
    fiber: z.coerce.number(),
    fats: z.coerce.number(),
    added_on: z.string(),
    protein: z.coerce.number(),
})

const foodsSchema = z.array(foodSchema)

/** List all foods */
router.get("/", async (req, res) => {
    const foods = await foodService.getAllFoods()
    res.json(foods)
})

/** Replace all foods */
router.put("/", async (req, res) => {
    const bodyParseResult = foodsSchema.safeParse(req.body)

    if (bodyParseResult.error) {
        logZodError(bodyParseResult.error)
        res.status(status.BAD_REQUEST).json({ error: bodyParseResult.error })
        return
    }

    const foodsToReplace = bodyParseResult.data
    const foods = await foodService.replaceAllFoods(foodsToReplace)
    res.status(status.CREATED).json(foods)
})

/** Create new food */
router.post("/", async (req, res) => {
    const createFoodSchema = z.object({
        name: z.string(),
        calories: z.number(),
        carbs: z.number(),
        fiber: z.number(),
        fats: z.number(),
        protein: z.number(),
        added_on: z.string(),
    })

    const createFoodsSchema = z.array(createFoodSchema)

    let result = null

    if (Array.isArray(req.body)) {
        result = createFoodsSchema.safeParse(req.body)
    }
    else {
        result = createFoodSchema.safeParse(req.body)
    }

    if (result.error) {
        logZodError(result.error)
        res.status(400).json({ error: result.error })
    }
    else {
        if (Array.isArray(result.data))
            await foodService.addFoods(result.data)
        else
            await foodService.addFood(result.data)
        res.status(201).json({ message: "ok" })
    }
})

router.get("/:food_id", async (req, res) => {
    const { food_id } = req.params
    const food = await foodService.getFoodById(food_id)

    if (!food) {
        res.status(404).json({
            error: "Food not found with id " + food_id,
        })
    }
    else
        res.json(food)
})

router.patch("/:food_id", async (req, res) => {
    const { food_id } = req.params

    const updateFoodSchema = z.object({
        name: z.string(),
        calories: z.number(),
        carbs: z.number(),
        fiber: z.number(),
        fats: z.number(),
        protein: z.number(),
        added_on: z.string(),
    })

    const result = updateFoodSchema.safeParse(req.body)

    if (result.error) {
        logZodError(result.error)
        res.status(400).json({ error: result.error })
    }
    else {
        const food = result.data
        const ok = await foodService.updateFood({ ...food, id: food_id })
        if (ok)
            res.status(201).json({ message: "ok" })
        else
            res.status(404).json({ message: "No food updated" })
    }
})

router.delete("/:food_id", async (req, res) => {
    const { food_id } = req.params
    const ok = await foodService.deleteFood(food_id)
    if (ok)
        res.json({ message: "Food deleted: " + food_id })
    else
        res.status(404).json({ message: "No food deleted with id " + food_id })
})

export const foodsRouter = router
