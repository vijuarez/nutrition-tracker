import { db } from "../db/db";
import { FoodSource, SourceSearchResult } from "../sources/base";
import { MockSource } from "../sources/mock-source";
import { UsdaSource } from "../sources/usda-source";
import { env } from "../env";

const REGISTRY: FoodSource[] = [
    new MockSource(),
    new UsdaSource(),
];

function getVisibleSources() {
    if (env.DEV) {
        return REGISTRY;
    }
    return REGISTRY.filter(s => !s.isDevOnly);
}

async function getUserConfigs(userId: string): Promise<Record<string, any>> {
    const configs = await db
        .selectFrom("user_source_config")
        .selectAll()
        .where("user_id", "=", userId)
        .execute();

    return configs.reduce((acc, curr) => {
        try {
            acc[curr.source_id] = JSON.parse(curr.config);
        } catch (e) {
            acc[curr.source_id] = {};
        }
        return acc;
    }, {} as Record<string, any>);
}

async function saveUserConfig(userId: string, sourceId: string, config: any) {
    const configString = JSON.stringify(config);

    await db
        .insertInto("user_source_config")
        .values({
            user_id: userId,
            source_id: sourceId,
            config: configString,
        })
        .onConflict((oc) =>
            oc.columns(["user_id", "source_id"]).doUpdateSet({
                config: configString,
            })
        )
        .execute();
}

async function getAvailableSources(userId: string) {
    const userConfigs = await getUserConfigs(userId);

    return getVisibleSources().map(source => ({
        id: source.id,
        name: source.name,
        description: source.description,
        fields: source.getConfigFields(),
        isReady: source.isReady(userConfigs[source.id]),
    }));
}

async function searchAll(userId: string, query: string): Promise<SourceSearchResult[]> {
    const userConfigs = await getUserConfigs(userId);
    const readySources = getVisibleSources().filter(s => s.isReady(userConfigs[s.id]));

    const searchPromises = readySources.map(async (source) => {
        try {
            return await source.search(query, userConfigs[source.id]);
        } catch (e) {
            console.error(`Error searching source ${source.id}:`, e);
            return [];
        }
    });

    const results = await Promise.all(searchPromises);
    return results.flat();
}

export const sourceService = {
    getAvailableSources,
    saveUserConfig,
    searchAll,
};
