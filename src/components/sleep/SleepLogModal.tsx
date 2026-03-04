import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { SleepEntry, SLEEP_FACTORS } from '../../types';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { v4 as uuidv4 } from 'uuid';

interface SleepLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: SleepEntry) => void;
  existingEntry?: SleepEntry;
  defaultDate?: string;
}

const QUALITY_LABELS = ['', 'Terrible', 'Poor', 'Fair', 'Good', 'Excellent'];

const FACTOR_LABELS: Record<string, string> = {
  caffeine: 'Caffeine',
  exercise: 'Exercise',
  stress: 'Stress',
  screen_time: 'Screen Time',
  alcohol: 'Alcohol',
  late_meal: 'Late Meal',
  nap: 'Nap',
  medication: 'Medication',
};

export const SleepLogModal: React.FC<SleepLogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingEntry,
  defaultDate,
}) => {
  const theme = useThemeClasses();
  const today = defaultDate || format(new Date(), 'yyyy-MM-dd');

  const [bedtime, setBedtime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState('');
  const [factors, setFactors] = useState<string[]>([]);
  const [date, setDate] = useState(today);

  useEffect(() => {
    if (existingEntry) {
      const bed = new Date(existingEntry.bedtime);
      const wake = new Date(existingEntry.wakeTime);
      setBedtime(format(bed, 'HH:mm'));
      setWakeTime(format(wake, 'HH:mm'));
      setQuality(existingEntry.quality);
      setNotes(existingEntry.notes || '');
      setFactors(existingEntry.factors);
      setDate(existingEntry.date);
    } else {
      setBedtime('22:30');
      setWakeTime('06:30');
      setQuality(3);
      setNotes('');
      setFactors([]);
      setDate(today);
    }
  }, [existingEntry, today]);

  const calculateDuration = (): number => {
    const [bedH, bedM] = bedtime.split(':').map(Number);
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);
    let bedMinutes = bedH * 60 + bedM;
    let wakeMinutes = wakeH * 60 + wakeM;
    // If wake is earlier than bed, it's the next day
    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60;
    }
    return wakeMinutes - bedMinutes;
  };

  const formatDuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const toggleFactor = (factor: string) => {
    setFactors(prev =>
      prev.includes(factor)
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  const handleSave = () => {
    const duration = calculateDuration();
    // Build ISO strings for bedtime/wakeTime
    const bedDate = new Date(`${date}T${bedtime}:00`);
    const wakeDate = new Date(`${date}T${wakeTime}:00`);
    // If wake is before bed, wake is next day
    if (wakeDate <= bedDate) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }

    const entry: SleepEntry = {
      id: existingEntry?.id || uuidv4(),
      date,
      bedtime: bedDate.toISOString(),
      wakeTime: wakeDate.toISOString(),
      durationMinutes: duration,
      quality,
      notes: notes.trim() || undefined,
      factors,
      createdAt: existingEntry?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(entry);
    onClose();
  };

  const duration = calculateDuration();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-md ${
              theme.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${theme.textPrimary}`}>
                {existingEntry ? 'Edit Sleep Log' : 'Log Sleep'}
              </h2>
              <button
                onClick={onClose}
                className={`p-1 rounded-lg ${theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Date */}
              <div>
                <label className={`text-sm font-medium ${theme.textSecondary} block mb-1`}>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className={`${theme.input} w-full text-sm`}
                />
              </div>

              {/* Bedtime & Wake Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-medium ${theme.textSecondary} flex items-center gap-1 mb-1`}>
                    <Moon className="w-3.5 h-3.5" /> Bedtime
                  </label>
                  <input
                    type="time"
                    value={bedtime}
                    onChange={e => setBedtime(e.target.value)}
                    className={`${theme.input} w-full text-sm`}
                  />
                </div>
                <div>
                  <label className={`text-sm font-medium ${theme.textSecondary} flex items-center gap-1 mb-1`}>
                    <Sun className="w-3.5 h-3.5" /> Wake Time
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={e => setWakeTime(e.target.value)}
                    className={`${theme.input} w-full text-sm`}
                  />
                </div>
              </div>

              {/* Duration display */}
              <div className={`text-center py-2 px-4 rounded-lg ${
                theme.isDark ? 'bg-gray-700/50' : 'bg-blue-50'
              }`}>
                <span className={`text-sm ${theme.textSecondary}`}>Duration: </span>
                <span className={`text-sm font-semibold ${theme.textPrimary}`}>
                  {formatDuration(duration)}
                </span>
              </div>

              {/* Quality */}
              <div>
                <label className={`text-sm font-medium ${theme.textSecondary} block mb-2`}>
                  Quality: {QUALITY_LABELS[quality]}
                </label>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map(q => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                        quality === q
                          ? q <= 2
                            ? 'bg-red-500 text-white'
                            : q === 3
                            ? 'bg-yellow-500 text-white'
                            : 'bg-green-500 text-white'
                          : theme.isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Factors */}
              <div>
                <label className={`text-sm font-medium ${theme.textSecondary} block mb-2`}>
                  Factors
                </label>
                <div className="flex flex-wrap gap-2">
                  {SLEEP_FACTORS.map(factor => (
                    <button
                      key={factor}
                      onClick={() => toggleFactor(factor)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        factors.includes(factor)
                          ? 'bg-blue-500 text-white'
                          : theme.isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {FACTOR_LABELS[factor] || factor}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={`text-sm font-medium ${theme.textSecondary} block mb-1`}>
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="How did you sleep?"
                  rows={2}
                  className={`${theme.input} w-full text-sm resize-none`}
                />
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {existingEntry ? 'Update' : 'Save'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
