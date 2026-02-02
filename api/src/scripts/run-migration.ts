import SQLite from 'better-sqlite3'


const migrations: Record<string, string> = {
    add_workouts: `
        ALTER TABLE day ADD COLUMN workout_calories INTEGER NOT NULL;
        ALTER TABLE day ADD COLUMN workout_note TEXT NOT NULL;
    `,
    add_calorie_targets: `
        ALTER TABLE user ADD COLUMN min_calories INTEGER;
        ALTER TABLE user ADD COLUMN max_calories INTEGER;
    `
}


function runMigration() {
    const args = process.argv.slice(2)
    const migrationName = args[0]

    console.log("Running migration:", migrationName)

    if (!(migrationName in migrations)) {
        throw new Error("No migration found with name " + migrationName)
    }

    const sql = migrations[migrationName]

    const db = new SQLite("./database/db.sqlite3")

    db.exec(sql)

    console.log("Success")
}

runMigration()