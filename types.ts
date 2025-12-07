export interface FoodInput {
  id: string;
  type: 'text' | 'image' | 'camera';
  value: string; // Text description or Base64 string
  portion?: string; // Optional portion text for manual entry
}

export interface ApiBreakdownItem {
  source: string;
  item: string;
  portion: string;
  totalAPI: number;
}

export interface AnalysisResult {
  totalScore: number;
  targetScore: number;
  deficiencyCategory: string; // e.g., "Vitamin C"
  percentage: number;
  breakdown: ApiBreakdownItem[];
  recommendation: {
    status: 'TARGET_MET' | 'DEFICIENT';
    message: string;
    foodSuggestion?: string;
  };
}

export enum InputType {
  TEXT = 'text',
  IMAGE = 'image',
  CAMERA = 'camera'
}