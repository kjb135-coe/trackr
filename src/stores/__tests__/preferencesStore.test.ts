import { usePreferencesStore } from '../preferencesStore';
import { preferencesRepository } from '../../repositories/preferencesRepository';

jest.mock('../../repositories/preferencesRepository');

describe('preferencesStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the store between tests
    usePreferencesStore.setState({
      preferences: {
        showOnboarding: true,
        celebrationLevel: 'normal',
        insights: true,
        installDate: new Date(),
      },
      error: null,
      isLoaded: false,
    });
  });

  it('sets error state when updatePreferences fails', async () => {
    (preferencesRepository.save as jest.Mock).mockRejectedValue(new Error('Storage full'));

    await usePreferencesStore.getState().updatePreferences({ theme: 'light' });

    expect(usePreferencesStore.getState().error).toBeTruthy();
  });

  it('clears error state on successful updatePreferences', async () => {
    // Set initial error
    usePreferencesStore.setState({ error: 'previous error' });
    (preferencesRepository.save as jest.Mock).mockResolvedValue(undefined);

    await usePreferencesStore.getState().updatePreferences({ theme: 'dark' });

    expect(usePreferencesStore.getState().error).toBeNull();
  });

  it('sets error state when loadPreferences fails', async () => {
    (preferencesRepository.get as jest.Mock).mockRejectedValue(new Error('DB error'));

    await usePreferencesStore.getState().loadPreferences();

    expect(usePreferencesStore.getState().error).toBeTruthy();
  });
});
