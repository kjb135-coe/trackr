import { createFeatureStore } from './createFeatureStore';
import { nutritionRepository } from '../repositories/nutritionRepository';
import { NutritionMeal } from '../types';

export const useNutritionStore = createFeatureStore<NutritionMeal>({
  name: 'Nutrition',
  repository: nutritionRepository,
  getId: (entry) => entry.id,
});
