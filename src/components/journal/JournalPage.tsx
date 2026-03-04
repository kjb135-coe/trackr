import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Trash2, Edit2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { JournalEntry } from '../../types';
import { useJournalStore } from '../../stores/journalStore';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { JournalEntryModal } from './JournalEntryModal';

const MOOD_EMOJIS = ['', '', '', '', '', ''];

export const JournalPage: React.FC = () => {
  const { entries, isLoading, loadEntries, addEntry, updateEntry, deleteEntry } = useJournalStore();
  const theme = useThemeClasses();
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleSave = async (entry: JournalEntry) => {
    if (editingEntry) {
      await updateEntry(entry);
    } else {
      await addEntry(entry);
    }
    setEditingEntry(undefined);
  };

  const handleEdit = (entry: JournalEntry) => {
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

  // Filter and sort
  const filteredEntries = entries
    .filter(entry => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        entry.title.toLowerCase().includes(q) ||
        entry.content.toLowerCase().includes(q) ||
        entry.tags.some(t => t.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  // Mood stats
  const moodAvg = entries.length > 0
    ? (entries.reduce((sum, e) => sum + e.mood, 0) / entries.length).toFixed(1)
    : '—';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`w-8 h-8 border-4 ${
          theme.isDark ? 'border-gray-700 border-t-purple-400' : 'border-gray-200 border-t-purple-600'
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
          <BookOpen className={`w-5 h-5 ${theme.isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <h1 className={`text-xl font-semibold ${theme.textPrimary}`}>Journal</h1>
          {entries.length > 0 && (
            <span className={`text-xs ${theme.textMuted} ml-1`}>
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} &middot; Avg mood {moodAvg}/5
            </span>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenNew}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Entry
        </motion.button>
      </div>

      {/* Search */}
      {entries.length > 0 && (
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textMuted}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className={`${theme.input} w-full text-sm pl-9`}
          />
        </div>
      )}

      {/* Entries */}
      {filteredEntries.length === 0 ? (
        <div className={`text-center py-12 ${theme.textMuted}`}>
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">
            {searchQuery ? 'No matching entries' : 'No journal entries yet'}
          </p>
          {!searchQuery && (
            <p className="text-xs mt-1">Tap "New Entry" to start writing</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.slice(0, 30).map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`p-4 rounded-lg ${
                theme.isDark ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
              } border ${theme.isDark ? 'border-gray-700/50' : 'border-gray-200'} transition-colors`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{MOOD_EMOJIS[entry.mood]}</span>
                    <h3 className={`text-sm font-semibold ${theme.textPrimary} truncate`}>
                      {entry.title}
                    </h3>
                    <span className={`text-xs ${theme.textMuted} shrink-0`}>
                      {format(new Date(entry.date + 'T12:00:00'), 'MMM d')}
                    </span>
                  </div>
                  {entry.content && (
                    <p className={`text-xs ${theme.textSecondary} line-clamp-2 mb-2`}>
                      {entry.content}
                    </p>
                  )}
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map(tag => (
                        <span
                          key={tag}
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            theme.isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(entry)}
                    aria-label={`Edit journal entry for ${entry.date}`}
                    className={`p-1.5 rounded-md ${
                      theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    } transition-colors`}
                  >
                    <Edit2 className={`w-3.5 h-3.5 ${theme.textMuted}`} />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    aria-label={`Delete journal entry for ${entry.date}`}
                    className={`p-1.5 rounded-md ${
                      theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    } transition-colors`}
                  >
                    <Trash2 className={`w-3.5 h-3.5 ${theme.textMuted}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <JournalEntryModal
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
