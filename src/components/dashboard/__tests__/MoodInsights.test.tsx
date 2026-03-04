import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { MoodInsights } from '../MoodInsights';
import { MoodData } from '../useMoodData';

const renderWithProviders = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

const makeMoodData = (overrides: Partial<MoodData> = {}): MoodData => ({
  averageMood: 3.8,
  moodTrend: [0, 4, 0, 3, 5, 0, 4],
  moodDates: ['2026-02-25', '2026-02-27', '2026-02-28', '2026-03-02'],
  entryCount: 4,
  correlation: null,
  ...overrides,
});

describe('MoodInsights', () => {
  it('renders nothing when no journal entries', () => {
    const data = makeMoodData({ entryCount: 0, averageMood: 0, moodTrend: [] });
    const { container } = renderWithProviders(<MoodInsights data={data} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays average mood value', () => {
    renderWithProviders(<MoodInsights data={makeMoodData()} />);
    expect(screen.getByText('3.8')).toBeInTheDocument();
  });

  it('displays entry count', () => {
    renderWithProviders(<MoodInsights data={makeMoodData({ entryCount: 12 })} />);
    expect(screen.getByText(/12 entries/)).toBeInTheDocument();
  });

  it('shows mood section heading', () => {
    renderWithProviders(<MoodInsights data={makeMoodData()} />);
    expect(screen.getByText('Mood Insights')).toBeInTheDocument();
  });

  it('shows correlation insight when data is available', () => {
    const data = makeMoodData({
      correlation: {
        highCompletionMood: 4.2,
        lowCompletionMood: 2.8,
        difference: 1.4,
        sampleSize: 10,
      },
    });
    renderWithProviders(<MoodInsights data={data} />);
    expect(screen.getByText(/mood averages/i)).toBeInTheDocument();
  });

  it('hides correlation when not enough data', () => {
    const data = makeMoodData({ correlation: null });
    renderWithProviders(<MoodInsights data={data} />);
    expect(screen.queryByText(/mood averages/i)).not.toBeInTheDocument();
  });

  it('renders sparkline SVG when mood trend data exists', () => {
    const data = makeMoodData({ moodTrend: [3, 4, 5, 4, 3] });
    const { container } = renderWithProviders(<MoodInsights data={data} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
