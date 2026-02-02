import Express from "express"
import cors from "cors"
import { authRouter } from "./routers/auth-router"
import cookieParser from "cookie-parser"
import { env } from "./env"
import { initDb } from "./db/init-db"
import { onboardRouter } from "./routers/onboard-router"
import { foodsRouter } from "./routers/foods-router"
import { dayRouter } from "./routers/day-router"
import { sourcesRouter } from "./routers/sources-router"
import { userRouter } from "./routers/user-router"


const apiRouter = Express.Router()
apiRouter.use("/onboard", onboardRouter)
apiRouter.use("/auth", authRouter)
apiRouter.use("/user", userRouter)
apiRouter.use("/foods", foodsRouter)
apiRouter.use("/day", dayRouter)
apiRouter.use("/sources", sourcesRouter)


apiRouter.use("/", (req, res) => { res.json({ msg: "Home route" }) })

const app = Express()
app.disable('x-powered-by')

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
    next()
})

app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true })) // Required for cookies to work with CORS
app.use(cookieParser())
app.use(Express.json()) // Body parser
app.use("/api", apiRouter)
app.use("/", (req, res) => { res.json({ msg: "Go to /api" }) })

// Error handler
app.use((err: any, req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    console.error("❌ UNHANDLED ERROR:", err)
    res.status(500).json({ error: "Internal Server Error", details: err.message })
})

const PORT = parseInt(env.API_PORT, 10)

app.listen(PORT, async () => {
    const mode = env.DEV ? "DEVELOPMENT" : "PRODUCTION"
    await initDb()
    console.log(`➡️  Express running on internal port ${PORT}...`)
    console.log(`➡️  mode = ${mode}`)
    console.log(`➡️  guard_routes = ${env.GUARD_ROUTES.toString().toUpperCase()}`)
    if (env.SINGLE_USER_MODE) {
        console.log("⚠️  SINGLE USER MODE ENABLED - Authentication is disabled. All users will share the same account.")
    }
})