import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Dumbbell, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { ExerciseEntry } from '../../types';
import { useExerciseStore } from '../../stores/exerciseStore';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { ExerciseLogModal } from './ExerciseLogModal';
import { ExerciseStats } from './ExerciseStats';

const INTENSITY_COLORS: Record<string, string> = {
  low: 'bg-blue-400/20 text-blue-400',
  moderate: 'bg-yellow-500/20 text-yellow-500',
  high: 'bg-red-500/20 text-red-500',
};

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

export const ExercisePage: React.FC = () => {
  const { entries, isLoading, error, clearError, loadEntries, addEntry, updateEntry, deleteEntry } = useExerciseStore();
  const theme = useThemeClasses();
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ExerciseEntry | undefined>();

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleSave = async (entry: ExerciseEntry) => {
    if (editingEntry) {
      await updateEntry(entry);
    } else {
      await addEntry(entry);
    }
    setEditingEntry(undefined);
  };

  const handleEdit = (entry: ExerciseEntry) => {
    setEditingEntry(entry);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
  };

  const handleOpenNew = () => {
    setEditingEntry(undefined);
    setShowModal(true);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`w-8 h-8 border-4 ${
          theme.isDark ? 'border-gray-700 border-t-green-400' : 'border-gray-200 border-t-green-600'
        } rounded-full animate-spin`} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-4 py-6 space-y-6"
    >
      {/* Error Banner */}
      {error && (
        <div role="alert" className={`flex items-center justify-between p-3 rounded-lg text-sm font-medium ${
          theme.isDark ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span>{error}</span>
          <button onClick={clearError} aria-label="Dismiss error" className="ml-2 font-bold hover:opacity-70">&times;</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className={`w-5 h-5 ${theme.isDark ? 'text-green-400' : 'text-green-600'}`} />
          <h1 className={`text-xl font-semibold ${theme.textPrimary}`}>Exercise</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenNew}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Log Exercise
        </motion.button>
      </div>

      {/* Stats */}
      <ExerciseStats entries={entries} />

      {/* Recent Entries */}
      <div>
        <h3 className={`text-sm font-medium ${theme.textSecondary} mb-3`}>Recent Entries</h3>
        {sortedEntries.length === 0 ? (
          <div className={`text-center py-12 ${theme.textMuted}`}>
            <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No exercise data yet</p>
            <p className="text-xs mt-1">Tap "Log Exercise" to start tracking</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedEntries.slice(0, 20).map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  theme.isDark ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
                } border ${theme.isDark ? 'border-gray-700/50' : 'border-gray-200'} transition-colors`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`text-xs font-medium ${theme.textSecondary} w-16 shrink-0`}>
                    {format(new Date(entry.date + 'T12:00:00'), 'MMM d')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${theme.textPrimary}`}>
                        {TYPE_LABELS[entry.type] || entry.type}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        INTENSITY_COLORS[entry.intensity]
                      }`}>
                        {entry.intensity}
                      </span>
                    </div>
                    <div className={`text-xs ${theme.textMuted}`}>
                      {formatDuration(entry.durationMinutes)}
                      {entry.caloriesBurned ? ` · ${entry.caloriesBurned} cal` : ''}
                      {entry.distance ? ` · ${entry.distance} ${entry.distanceUnit}` : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(entry)}
                    aria-label={`Edit exercise entry for ${entry.date}`}
                    className={`p-1.5 rounded-md ${
                      theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    } transition-colors`}
                  >
                    <Edit2 className={`w-3.5 h-3.5 ${theme.textMuted}`} />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    aria-label={`Delete exercise entry for ${entry.date}`}
                    className={`p-1.5 rounded-md ${
                      theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    } transition-colors`}
                  >
                    <Trash2 className={`w-3.5 h-3.5 ${theme.textMuted}`} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <ExerciseLogModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingEntry(undefined);
        }}
        onSave={handleSave}
        existingEntry={editingEntry}
      />
    </motion.div>
  );
};
