import axios from "axios"
import type { Day, FoodSource, MonthlyData, SourceSearchResult, User, UserTargets } from "./types"
import { env } from "./env"
import type { Food } from "./types.backend"


// Smartly determine the API base URL. 
// If it's localhost, we replace it with the current hostname to support local network access.
const getBaseURL = () => {
    const url = env.VITE_API_URL
    if (url && url.includes('localhost')) {
        return url.replace('localhost', window.location.hostname)
    }
    return url
}

axios.defaults.baseURL = getBaseURL()

axios.defaults.withCredentials = true // Required for cookies to work


async function createFoods(foods: Omit<Food, "id">[]): Promise<Day[] | null> {
    const response = await axios.post("foods", foods)
    const ok = response.status >= 200 && response.status < 400
    return ok ? response.data : null
}

async function getDay(day: string): Promise<Day | null> {
    const response = await axios.get("day/" + day)
    const ok = response.status >= 200 && response.status < 400
    return ok ? response.data : null
}

async function setDay(day: Day): Promise<boolean> {
    const response = await axios.put("day/" + day.date, day)
    const ok = response.status >= 200 && response.status < 400
    return ok
}

async function getFoodById(food_id: string) {
    const response = await axios.put<Food>("food/" + food_id)
    return response.data
}

async function getAllFoods() {
    const response = await axios.get<Food[]>("foods")
    return response.data
}

async function setAllFoods(foods: Omit<Food, "id">[]) {
    const response = await axios.put<Food[]>("foods", foods)
    return response.data
}

async function checkOnboarding(): Promise<boolean> {
    const response = await axios.get("onboard")
    return response.data
}

async function deleteFood(foodId: string): Promise<boolean> {
    const response = await axios.delete("foods/" + foodId)
    return response.data
}

async function updateFood(food: Food): Promise<boolean> {
    const response = await axios.patch("foods/" + food.id, food)
    return response.data
}

async function signup(username: string, password: string): Promise<User> {
    const response = await axios.post("auth/signup", {
        username,
        password,
    })
    return response.data
}

async function loginWithCredentials(username: string, password: string): Promise<User> {
    const response = await axios.post("auth/login", {
        username,
        password,
    })
    return response.data
}

async function loginWithCookies(): Promise<User | null> {
    try {
        const response = await axios.get("auth/user")
        const ok = response.status >= 200 && response.status < 400
        return ok ? response.data : null
    }
    catch (error) {
        return null
    }
}

async function logout(): Promise<boolean> {
    const response = await axios.post("auth/logout")
    const ok = response.status >= 200 && response.status < 400
    return ok
}

async function getSources(): Promise<FoodSource[]> {
    const response = await axios.get("sources")
    return response.data
}

async function saveSourceConfig(sourceId: string, config: any): Promise<void> {
    await axios.post(`sources/${sourceId}/config`, config)
}

async function searchRemote(query: string): Promise<SourceSearchResult[]> {
    const response = await axios.get("sources/search", { params: { q: query } })
    return response.data
}

async function getUser(): Promise<User | null> {
    try {
        const response = await axios.get("user/")
        const ok = response.status >= 200 && response.status < 400
        return ok ? response.data : null
    }
    catch (error) {
        return null
    }
}

async function updateUserTargets(targets: UserTargets): Promise<User | null> {
    try {
        const response = await axios.put("user/targets", targets)
        const ok = response.status >= 200 && response.status < 400
        return ok ? response.data : null
    }
    catch (error) {
        return null
    }
}

async function getMonthData(year: number, month: number): Promise<MonthlyData | null> {
    try {
        const response = await axios.get(`day/month/${year}/${month}`)
        const ok = response.status >= 200 && response.status < 400
        return ok ? response.data : null
    }
    catch (error) {
        return null
    }
}

export const api = {
    getDay,
    setDay,
    getFoodById,
    getAllFoods,
    setAllFoods,
    checkOnboarding,
    signup,
    loginWithCredentials,
    loginWithCookies,
    logout,
    createFoods,
    deleteFood,
    updateFood,
    getSources,
    saveSourceConfig,
    searchRemote,
    getUser,
    updateUserTargets,
    getMonthData,
}
