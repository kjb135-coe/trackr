import { createFeatureStore } from './createFeatureStore';
import { sleepRepository } from '../repositories/sleepRepository';
import { SleepEntry } from '../types';

export const useSleepStore = createFeatureStore<SleepEntry>({
  name: 'Sleep',
  repository: sleepRepository,
  getId: (entry) => entry.id,
});
