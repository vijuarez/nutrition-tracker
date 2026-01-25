import { sql } from "kysely";
import { db } from "../db/db";


async function createUserTable(): Promise<boolean> {
    const result = await sql`
        CREATE TABLE IF NOT EXISTS user (
            id              TEXT PRIMARY KEY NOT NULL,
            username        TEXT UNIQUE NOT NULL,
            password_hash   TEXT NOT NULL,
            created_on      INTEGER NOT NULL,
            updated_on      INTEGER NOT NULL
        )
    `.execute(db)

    return result.numAffectedRows !== undefined && result.numAffectedRows > 0
}

async function createSessionTable(): Promise<boolean> {
    const result = await sql`
        CREATE TABLE IF NOT EXISTS session (
            id              TEXT PRIMARY KEY NOT NULL,
            user_id         TEXT NOT NULL,
            expires_on      INTEGER NOT NULL
        )
    `.execute(db)

    return result.numAffectedRows !== undefined && result.numAffectedRows > 0
}

async function createFoodTable(): Promise<boolean> {
    const result = await sql`
        CREATE TABLE IF NOT EXISTS food (
            id              TEXT PRIMARY KEY NOT NULL,
            name            TEXT NOT NULL,
            calories        REAL NOT NULL,
            carbs           REAL NOT NULL,
            protein         REAL NOT NULL,
            fats            REAL NOT NULL,
            fiber           REAL NOT NULL,
            added_on        TEXT NOT NULL
        )
    `.execute(db)

    return result.numAffectedRows !== undefined && result.numAffectedRows > 0
}

async function createSourceConfigTable(): Promise<boolean> {
    const result = await sql`
        CREATE TABLE IF NOT EXISTS user_source_config (
            user_id         TEXT NOT NULL,
            source_id       TEXT NOT NULL,
            config          TEXT NOT NULL,
            PRIMARY KEY (user_id, source_id),
            FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
        )
    `.execute(db)

    return result.numAffectedRows !== undefined && result.numAffectedRows > 0
}

async function createDayTable(): Promise<boolean> {

    const result = await sql`
        CREATE TABLE IF NOT EXISTS day (
            date            TEXT PRIMARY KEY NOT NULL,
            complete        INTEGER NOT NULL,
            raw             TEXT NOT NULL,
            workout_calories INTEGER,
            workout_note    TEXT
        )
    `.execute(db)

    return result.numAffectedRows !== undefined && result.numAffectedRows > 0
}


/**
For example:
- "30 banana"        -> grams=30, foodname=banana
- "10 chocolate 500" -> grams=10, foodname=chocolate, override_calories_100g=500
- "50c cookies"      -> grams=null, foodname=cookies, override_calories=50
*/
async function createDayEntryTable(): Promise<boolean> {

    const result = await sql`
        CREATE TABLE IF NOT EXISTS day_entry (
            id              TEXT PRIMARY KEY NOT NULL,
            date            TEXT NOT NULL,
            
            raw             TEXT NOT NULL,
            calories        REAL NOT NULL,
            food_id         TEXT,
            grams           REAL,
            foodname        TEXT,
            calories_100g   REAL,

            override_calories_100g REAL,
            override_calories REAL,

            sort            INTEGER NOT NULL
        )
    `.execute(db)

    return result.numAffectedRows !== undefined && result.numAffectedRows > 0
}

async function createSettingsTable() {
    const result = await sql`
        CREATE TABLE IF NOT EXISTS settings (
            id                  INT PRIMARY KEY,
            target_calories     INT,
            target_carbs        INT,
            target_protein      INT,
            target_fats         INT,
            target_fiber        INT
        )
    `.execute(db)
}

export const schemaService = {
    createUserTable,
    createSessionTable,
    createFoodTable,
    createDayEntryTable,
    createSourceConfigTable,
    createSettingsTable,
    createDayTable,
}