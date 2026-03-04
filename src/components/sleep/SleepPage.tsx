import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Moon, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { SleepEntry } from '../../types';
import { useSleepStore } from '../../stores/sleepStore';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { SleepLogModal } from './SleepLogModal';
import { SleepWeekView } from './SleepWeekView';
import { SleepStats } from './SleepStats';

const QUALITY_LABELS = ['', 'Terrible', 'Poor', 'Fair', 'Good', 'Excellent'];

export const SleepPage: React.FC = () => {
  const { entries, isLoading, loadEntries, addEntry, updateEntry, deleteEntry } = useSleepStore();
  const theme = useThemeClasses();
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SleepEntry | undefined>();
  const [defaultDate, setDefaultDate] = useState<string | undefined>();

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleSave = async (entry: SleepEntry) => {
    if (editingEntry) {
      await updateEntry(entry);
    } else {
      await addEntry(entry);
    }
    setEditingEntry(undefined);
  };

  const handleEdit = (entry: SleepEntry) => {
    setEditingEntry(entry);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
  };

  const handleDayClick = (dateStr: string) => {
    const existing = entries.find(e => e.date === dateStr);
    if (existing) {
      handleEdit(existing);
    } else {
      setEditingEntry(undefined);
      setDefaultDate(dateStr);
      setShowModal(true);
    }
  };

  const handleOpenNew = () => {
    setEditingEntry(undefined);
    setDefaultDate(undefined);
    setShowModal(true);
  };

  const formatDuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  // Sort entries by date descending for the list
  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`w-8 h-8 border-4 ${
          theme.isDark ? 'border-gray-700 border-t-blue-400' : 'border-gray-200 border-t-blue-600'
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Moon className={`w-5 h-5 ${theme.isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <h1 className={`text-xl font-semibold ${theme.textPrimary}`}>Sleep</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenNew}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Log Sleep
        </motion.button>
      </div>

      {/* Stats */}
      <SleepStats entries={entries} />

      {/* Week View */}
      <div className={`p-4 rounded-xl ${
        theme.isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'
      } border`}>
        <SleepWeekView entries={entries} onDayClick={handleDayClick} />
      </div>

      {/* Recent Entries */}
      <div>
        <h3 className={`text-sm font-medium ${theme.textSecondary} mb-3`}>Recent Entries</h3>
        {sortedEntries.length === 0 ? (
          <div className={`text-center py-12 ${theme.textMuted}`}>
            <Moon className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No sleep data yet</p>
            <p className="text-xs mt-1">Tap "Log Sleep" to start tracking</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedEntries.slice(0, 14).map((entry, i) => (
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
                    <div className={`text-sm font-medium ${theme.textPrimary}`}>
                      {formatDuration(entry.durationMinutes)}
                    </div>
                    <div className={`text-xs ${theme.textMuted}`}>
                      {QUALITY_LABELS[entry.quality]} &middot;{' '}
                      {format(new Date(entry.bedtime), 'h:mm a')} – {format(new Date(entry.wakeTime), 'h:mm a')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(entry)}
                    className={`p-1.5 rounded-md ${
                      theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    } transition-colors`}
                  >
                    <Edit2 className={`w-3.5 h-3.5 ${theme.textMuted}`} />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
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
      <SleepLogModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingEntry(undefined);
          setDefaultDate(undefined);
        }}
        onSave={handleSave}
        existingEntry={editingEntry}
        defaultDate={defaultDate}
      />
    </motion.div>
  );
};
