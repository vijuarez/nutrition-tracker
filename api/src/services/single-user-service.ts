import { userService } from "./user-service"
import { User } from "../db/schema"

const SINGLE_USER_USERNAME = "default"
const SINGLE_USER_PASSWORD = "default" // Only used internally, never exposed

/**
 * Gets or creates the single global user for single-user mode.
 * This is useful for NAS setups where authentication is not needed.
 */
async function getOrCreateSingleUser(): Promise<User | undefined> {
    // First, try to find the single user
    let user = await userService.getUserByUsername(SINGLE_USER_USERNAME)
    
    if (!user) {
        // Create the single user if it doesn't exist
        user = await userService.createUser(SINGLE_USER_USERNAME, SINGLE_USER_PASSWORD)
    }
    
    return user
}

/**
 * Checks if single user mode is enabled via environment variable.
 */
function isSingleUserMode(): boolean {
    const { env } = require("../env")
    return env.SINGLE_USER_MODE
}

export const singleUserService = {
    getOrCreateSingleUser,
    isSingleUserMode,
    SINGLE_USER_USERNAME,
}
