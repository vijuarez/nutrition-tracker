import { FoodSource, SourceConfigField, SourceSearchResult } from "./base";

export class MockSource extends FoodSource {
  readonly id = 'mock';
  readonly name = 'Mock Source';
  readonly description = 'A mock source for testing purposes. Requires a dummy API key.';

  getConfigFields(): SourceConfigField[] {
    return [
      { key: 'apiKey', label: 'Dummy API Key', type: 'text' }
    ];
  }

  async search(query: string, config: any): Promise<SourceSearchResult[]> {
    if (!this.isReady(config)) {
      throw new Error('Mock source is not configured');
    }

    // Return some mock data based on the query
    return [
      {
        id: 'mock-1',
        name: `${query} (Mock)`,
        calories: 100,
        carbs: 10,
        protein: 5,
        fats: 2,
        fiber: 1
      },
      {
        id: 'mock-2',
        name: `Large ${query} (Mock)`,
        calories: 200,
        carbs: 20,
        protein: 10,
        fats: 4,
        fiber: 2
      }
    ];
  }
}
