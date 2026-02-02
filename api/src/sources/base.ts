export interface SourceSearchResult {
  id: string;          // Source-specific unique ID
  name: string;
  calories: number;    // per 100g
  carbs: number;
  protein: number;
  fats: number;
  fiber: number;
}

export interface SourceConfigField {
  key: string;
  label: string;
  type: 'text' | 'password';
}

export abstract class FoodSource {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  readonly isDevOnly: boolean = false;

  // Defines what the UI needs to collect from the user (e.g., API Key)
  abstract getConfigFields(): SourceConfigField[];

  // Performs the remote search
  abstract search(query: string, config: any): Promise<SourceSearchResult[]>;

  // Validates if the source has the necessary config to operate
  isReady(config: any): boolean {
    return this.getConfigFields().every(f => !!config?.[f.key]);
  }
}
