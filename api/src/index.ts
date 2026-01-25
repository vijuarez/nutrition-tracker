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


const apiRouter = Express.Router()
apiRouter.use("/onboard", onboardRouter)
apiRouter.use("/auth", authRouter)
apiRouter.use("/foods", foodsRouter)
apiRouter.use("/day", dayRouter)
apiRouter.use("/sources", sourcesRouter)


apiRouter.use("/", (req, res) => { res.json({ msg: "Home route" }) })

const app = Express()
app.disable('x-powered-by')
app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true })) // Required for cookies to work with CORS
app.use(cookieParser())
app.use(Express.json()) // Body parser
app.use("/api", apiRouter)
app.use("/", (req, res) => { res.json({ msg: "Go to /api" }) })

app.listen(4000, async () => {
    const mode = env.DEV ? "DEVELOPMENT" : "PRODUCTION"
    await initDb()
    console.log(`➡️  Express running on internal port 4000...`)
    console.log(`➡️  mode = ${mode}`)
    console.log(`➡️  guard_routes = ${env.GUARD_ROUTES.toString().toUpperCase()}`)
})