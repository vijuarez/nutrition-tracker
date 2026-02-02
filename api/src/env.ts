import z from "zod"
import "dotenv/config"

const envSchema = z.object({
    DATABASE_URL: z.string(),
    DEV: z.enum(["true", "false"]).default("false"),
    GUARD_ROUTES: z.enum(["true", "false"]).default("true"),
    FRONTEND_ORIGIN: z.string().transform(val => val.split(',').map(s => s.trim())),
    API_PORT: z.string().default("4000"),
})

const rawEnv = envSchema.parse(process.env)

export const env = {
    ...rawEnv,
    DEV: rawEnv.DEV === "true",
    GUARD_ROUTES: rawEnv.GUARD_ROUTES === "true",
}