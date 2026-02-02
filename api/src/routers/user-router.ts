import Express from "express"
import { z } from "zod"
import { userService } from "../services/user-service"
import { logZodError } from "../utils"
import { userGuardMiddleware } from "../middleware/user-guard-middleware"
import status from "http-status"

const router = Express.Router()

const updateTargetsSchema = z.object({
    min_calories: z.number().int().min(0).nullable(),
    max_calories: z.number().int().min(0).nullable(),
})

// Get user with calorie targets
router.get("/", userGuardMiddleware, async (req: any, res) => {
    const user = req.user

    res.json({
        id: user.id,
        username: user.username,
        created_on: user.created_on,
        updated_on: user.updated_on,
        min_calories: user.min_calories,
        max_calories: user.max_calories,
    })
})

// Update calorie targets
router.put("/targets", userGuardMiddleware, async (req: any, res) => {
    const result = updateTargetsSchema.safeParse(req.body)

    if (result.error) {
        logZodError(result.error)
        res.status(status.BAD_REQUEST).json({
            message: "Invalid calorie targets",
            error: result.error,
        })
        return
    }

    const user = req.user
    const { min_calories, max_calories } = result.data

    // Validate that min <= max if both are set
    if (min_calories !== null && max_calories !== null && min_calories > max_calories) {
        res.status(status.BAD_REQUEST).json({
            message: "min_calories cannot be greater than max_calories",
        })
        return
    }

    const updatedUser = {
        ...user,
        min_calories,
        max_calories,
        updated_on: Date.now(),
    }

    const ok = await userService.updateUser(updatedUser)

    if (!ok) {
        res.status(status.INTERNAL_SERVER_ERROR).json({
            message: "Could not update user targets",
        })
        return
    }

    res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        created_on: updatedUser.created_on,
        updated_on: updatedUser.updated_on,
        min_calories: updatedUser.min_calories,
        max_calories: updatedUser.max_calories,
    })
})

export const userRouter = router
