import Express from "express"
import { z } from "zod"
import { sessionService } from "../services/session-service"
import { userService } from "../services/user-service"
import { checkPasswordHash, logZodError, sessionIsValid } from "../utils"
import { User } from "../db/schema"
import { userGuardMiddleware } from "../middleware/user-guard-middleware"
import status from "http-status"
import { sessionIdCookie } from "../constants"
import { env } from "../env"

const router = Express.Router()

const userSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(5),
})

// Create new user
router.post("/signup", async (req, res) => {
    // This route is only enabled when there are no users
    const users = await userService.countUsers()

    if (users > 0) {
        res.status(405).json({ message: "User account already created." })
        return
    }

    const result = userSchema.safeParse(req.body)

    if (result.error) {
        logZodError(result.error)
        res.status(status.BAD_REQUEST).json({
            message: "Invalid/missing username and/or password provided",
            error: result.error,
        })
        return
    }

    const { username, password } = result.data

    const newUser = await userService.createUser(username, password)

    if (!newUser) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ message: "Could not create new user" })
        return
    }

    res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        created_on: newUser.created_on,
        updated_on: newUser.updated_on,
    })
})

// Login with username and password
router.post("/login", async (req, res) => {
    const result = userSchema.safeParse(req.body)

    if (result.error) {
        logZodError(result.error)
        res.status(400).json({ error: result.error })
        return
    }

    const { username, password } = result.data

    // Check if username exists
    const user = await userService.getUserByUsername(username)

    if (!user) {
        res.status(403).json({ message: "Invalid username/password combination" })
        return
    }

    const validPassword = checkPasswordHash(password, user.password_hash)

    if (!validPassword) {
        res.status(403).json({ message: "Invalid username/password combination" })
        return
    }

    // Check if session already exists
    const { sid } = req.cookies
    if (sid) {
        const session = await sessionService.getSession(sid)
        if (session && sessionIsValid(session)) {
            await sessionService.refreshSession(sid)
            res.status(201).json({
                message: "Already logged in",
                user: {
                    id: user.id,
                    created_on: user.created_on,
                    username: user.username,
                    updated_on: user.updated_on,
                },
            })
            return
        }
    }

    const newSession = await sessionService.createSession(user.id)

    if (!newSession) {
        res.status(500).json({ message: "Valid login but could not create session" })
        return
    }

    // Set cookie with session id
    res.cookie(sessionIdCookie, newSession.id, {
        httpOnly: true, // XSS protection
        secure: !env.DEV,
        expires: new Date(newSession.expires_on),
    })

    res.status(201).json({
        message: "Logged in",
        user: {
            id: user.id,
            username: user.username,
            created_on: user.created_on,
            updated_on: user.updated_on,
        },
    })
})

router.post("/logout", async (req, res) => {
    const { sid } = req.cookies

    if (!sid) {
        res.json({ message: "Already logged out" })
        return
    }

    const ok = await sessionService.deleteSession(sid)

    if (!ok) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ message: "Could not close session" })
        return
    }

    res.json({ message: "Logged out" })
})

router.get("/user", userGuardMiddleware, async (req: any, res) => {
    const user = req.user as User

    res.json({
        id: user?.id,
        username: user?.username,
        created_on: user?.created_on,
        updated_on: user?.updated_on,
    })
})

export const authRouter = router
