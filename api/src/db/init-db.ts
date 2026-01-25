import { schemaService } from "../services/schema-service";

export async function initDb() {
    console.log("Initializing database...")

    await schemaService.createUserTable()
    console.log("✅ createUserTable")

    await schemaService.createSessionTable()
    console.log("✅ createSessionTable")

    await schemaService.createFoodTable()
    console.log("✅ createFoodTable")

    await schemaService.createSourceConfigTable()
    console.log("✅ createSourceConfigTable")

    await schemaService.createDayEntryTable()
    console.log("✅ createDayEntryTable")

    await schemaService.createDayTable()
    console.log("✅ createDayTable")

    console.info("✅ initialize database")
}
