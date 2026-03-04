import { createFeatureStore } from './createFeatureStore';
import { journalRepository } from '../repositories/journalRepository';
import { JournalEntry } from '../types';

export const useJournalStore = createFeatureStore<JournalEntry>({
  name: 'Journal',
  repository: journalRepository,
  getId: (entry) => entry.id,
});
