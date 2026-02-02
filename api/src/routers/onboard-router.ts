import Express from "express"
import { userService } from "../services/user-service"
import { singleUserService } from "../services/single-user-service"
import { env } from "../env"


const router = Express.Router()


router.get("/", async (req, res) => {
    // In single user mode, we auto-create the user so onboarding is never needed
    if (env.SINGLE_USER_MODE) {
        // Ensure the single user exists
        await singleUserService.getOrCreateSingleUser()
        res.json(false) // No onboarding needed
        return
    }
    
    const users = await userService.countUsers()
    res.json(users === 0)
})


export const onboardRouter = router