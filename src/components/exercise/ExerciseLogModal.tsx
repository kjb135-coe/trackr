import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { ExerciseEntry, EXERCISE_TYPES } from '../../types';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { v4 as uuidv4 } from 'uuid';

interface ExerciseLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: ExerciseEntry) => void;
  existingEntry?: ExerciseEntry;
  defaultDate?: string;
}

const INTENSITY_OPTIONS: { value: 'low' | 'moderate' | 'high'; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
];

const TYPE_LABELS: Record<string, string> = {
  running: 'Running',
  cycling: 'Cycling',
  swimming: 'Swimming',
  weightlifting: 'Weights',
  yoga: 'Yoga',
  walking: 'Walking',
  hiking: 'Hiking',
  sports: 'Sports',
  cardio: 'Cardio',
  stretching: 'Stretching',
  other: 'Other',
};

export const ExerciseLogModal: React.FC<ExerciseLogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingEntry,
  defaultDate,
}) => {
  const theme = useThemeClasses();
  const today = defaultDate || format(new Date(), 'yyyy-MM-dd');

  const [date, setDate] = useState(today);
  const [type, setType] = useState<string>('running');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [caloriesBurned, setCaloriesBurned] = useState<string>('');
  const [distance, setDistance] = useState<string>('');
  const [distanceUnit, setDistanceUnit] = useState<'miles' | 'km'>('miles');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (existingEntry) {
      setDate(existingEntry.date);
      setType(existingEntry.type);
      setDurationMinutes(existingEntry.durationMinutes);
      setIntensity(existingEntry.intensity);
      setCaloriesBurned(existingEntry.caloriesBurned?.toString() || '');
      setDistance(existingEntry.distance?.toString() || '');
      setDistanceUnit(existingEntry.distanceUnit || 'miles');
      setNotes(existingEntry.notes || '');
    } else {
      setDate(today);
      setType('running');
      setDurationMinutes(30);
      setIntensity('moderate');
      setCaloriesBurned('');
      setDistance('');
      setDistanceUnit('miles');
      setNotes('');
    }
  }, [existingEntry, today]);

  const handleSave = () => {
    const entry: ExerciseEntry = {
      id: existingEntry?.id || uuidv4(),
      date,
      type,
      durationMinutes,
      intensity,
      caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : undefined,
      distance: distance ? parseFloat(distance) : undefined,
      distanceUnit: distance ? distanceUnit : undefined,
      notes: notes.trim() || undefined,
      createdAt: existingEntry?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(entry);
    onClose();
  };

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
                {existingEntry ? 'Edit Exercise' : 'Log Exercise'}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close dialog"
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

              {/* Exercise Type */}
              <div>
                <label className={`text-sm font-medium ${theme.textSecondary} block mb-2`}>Type</label>
                <div className="flex flex-wrap gap-2">
                  {EXERCISE_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        type === t
                          ? 'bg-green-500 text-white'
                          : theme.isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {TYPE_LABELS[t] || t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className={`text-sm font-medium ${theme.textSecondary} block mb-1`}>
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`${theme.input} w-full text-sm`}
                />
              </div>

              {/* Intensity */}
              <div>
                <label className={`text-sm font-medium ${theme.textSecondary} block mb-2`}>Intensity</label>
                <div className="flex gap-2">
                  {INTENSITY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setIntensity(opt.value)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                        intensity === opt.value
                          ? opt.value === 'low'
                            ? 'bg-blue-400 text-white'
                            : opt.value === 'moderate'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-red-500 text-white'
                          : theme.isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calories (optional) */}
              <div>
                <label className={`text-sm font-medium ${theme.textSecondary} block mb-1`}>
                  Calories burned (optional)
                </label>
                <input
                  type="number"
                  min={0}
                  value={caloriesBurned}
                  onChange={e => setCaloriesBurned(e.target.value)}
                  placeholder="e.g. 250"
                  className={`${theme.input} w-full text-sm`}
                />
              </div>

              {/* Distance (optional) */}
              <div>
                <label className={`text-sm font-medium ${theme.textSecondary} block mb-1`}>
                  Distance (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={distance}
                    onChange={e => setDistance(e.target.value)}
                    placeholder="e.g. 3.5"
                    className={`${theme.input} flex-1 text-sm`}
                  />
                  <select
                    value={distanceUnit}
                    onChange={e => setDistanceUnit(e.target.value as 'miles' | 'km')}
                    className={`${theme.input} text-sm w-20`}
                  >
                    <option value="miles">mi</option>
                    <option value="km">km</option>
                  </select>
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
                  placeholder="How was the workout?"
                  rows={2}
                  className={`${theme.input} w-full text-sm resize-none`}
                />
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
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
