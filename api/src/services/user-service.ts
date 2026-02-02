import { sql } from "kysely";
import { db } from "../db/db";
import { hashPassword, unixNow, uuid } from "../utils";
import { User } from "../db/schema";


// async function getAllUsers(): Promise<User[]> {
//     const users = await db
//         .selectFrom("user")
//         .selectAll()
//         .execute()
//     return users
// }

async function countUsers(): Promise<number> {
    const result = await db
        .selectFrom("user")
        .select(qb => qb.fn.countAll<number>().as("count"))
        .executeTakeFirst()

    return result?.count || 0
}

async function createUser(username: string, password: string): Promise<User | undefined> {

    const user: User = {
        created_on: unixNow(),
        updated_on: unixNow(),
        password_hash: hashPassword(password),
        username,
        id: uuid(),
        min_calories: null,
        max_calories: null,
    }

    const users = await db
        .insertInto("user")
        .values(user)
        .execute()

    if (users.length > 0)
        return user

    return undefined
}

async function updateUser(user: User): Promise<boolean> {

    const results = await db
        .updateTable("user")
        .set(user)
        .execute()

    return results.length > 0
}

async function getUserById(id: string): Promise<User | undefined> {
    const user = await db
        .selectFrom("user")
        .selectAll()
        .where("user.id", "=", id)
        .executeTakeFirst()

    return user
}

async function getUserByUsername(username: string): Promise<User | undefined> {
    const user = await db
        .selectFrom("user")
        .selectAll()
        .where("username", "=", username)
        .executeTakeFirst()

    return user
}

export const userService = {
    createUser,
    countUsers,
    updateUser,
    getUserById,
    getUserByUsername,
}