import { FoodSource, SourceConfigField, SourceSearchResult } from "./base";

export class UsdaSource extends FoodSource {
  readonly id = 'usda';
  readonly name = 'USDA FoodData Central';
  readonly description = 'Official USDA food database. Requires a free API key from fdc.nal.usda.gov.';

  getConfigFields(): SourceConfigField[] {
    return [
      { key: 'apiKey', label: 'API Key', type: 'password' }
    ];
  }

  async search(query: string, config: any): Promise<SourceSearchResult[]> {
    if (!this.isReady(config)) {
      throw new Error('USDA source is not configured');
    }

    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${config.apiKey}&pageSize=10`;

    const response = await fetch(url);
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`USDA API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const foods = data.foods || [];

    return foods.map((food: any) => {
      const nutrients = food.foodNutrients || [];
      
      const getNutrient = (ids: number[], names: string[]) => {
        const n = nutrients.find((n: any) => 
            ids.includes(n.nutrientId) || 
            ids.includes(parseInt(n.nutrientNumber)) ||
            names.some(name => n.nutrientName?.toLowerCase().includes(name.toLowerCase()))
        );
        return n ? n.value : 0;
      };

      return {
        id: `usda-${food.fdcId}`,
        name: food.description + (food.brandOwner ? ` (${food.brandOwner})` : ''),
        // USDA nutrients are typically per 100g in search results
        calories: getNutrient([1008, 208], ['energy', 'calories']),
        carbs: getNutrient([1005, 205], ['carbohydrate']),
        protein: getNutrient([1003, 203], ['protein']),
        fats: getNutrient([1004, 204], ['total lipid', 'fat']),
        fiber: getNutrient([1079, 291], ['fiber']),
      };
    });
  }
}
