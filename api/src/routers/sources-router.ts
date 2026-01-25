import Express from "express"
import { z } from "zod"
import { sourceService } from "../services/source-service"
import status from "http-status"
import { userGuardMiddleware } from "../middleware/user-guard-middleware"

const router = Express.Router()

router.use(userGuardMiddleware)

/** List all available sources and their status for the current user */
router.get("/", async (req, res) => {
    const user = (req as any).user
    const sources = await sourceService.getAvailableSources(user.id)
    res.json(sources)
})

/** Save configuration for a specific source */
router.post("/:sourceId/config", async (req, res) => {
    const user = (req as any).user
    const { sourceId } = req.params
    const config = req.body

    // Basic validation: config should be an object
    if (typeof config !== 'object' || config === null) {
        res.status(status.BAD_REQUEST).json({ error: "Invalid configuration" })
        return
    }

    await sourceService.saveUserConfig(user.id, sourceId, config)
    res.json({ message: "Configuration saved" })
})

/** Search across all configured sources */
router.get("/search", async (req, res) => {
    const user = (req as any).user
    const query = req.query.q as string

    if (!query) {
        res.status(status.BAD_REQUEST).json({ error: "Query parameter 'q' is required" })
        return
    }

    const results = await sourceService.searchAll(user.id, query)
    res.json(results)
})

export const sourcesRouter = router
