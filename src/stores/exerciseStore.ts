import { createFeatureStore } from './createFeatureStore';
import { exerciseRepository } from '../repositories/exerciseRepository';
import { ExerciseEntry } from '../types';

export const useExerciseStore = createFeatureStore<ExerciseEntry>({
  name: 'Exercise',
  repository: exerciseRepository,
  getId: (entry) => entry.id,
});
