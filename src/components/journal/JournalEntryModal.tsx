import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { JournalEntry } from '../../types';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { v4 as uuidv4 } from 'uuid';

interface JournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: JournalEntry) => void;
  existingEntry?: JournalEntry;
}

const MOOD_EMOJIS = ['', '', '', '', '', ''];
const MOOD_LABELS = ['', 'Awful', 'Bad', 'Okay', 'Good', 'Great'];

export const JournalEntryModal: React.FC<JournalEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingEntry,
}) => {
  const theme = useThemeClasses();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [date, setDate] = useState(today);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (existingEntry) {
      setDate(existingEntry.date);
      setTitle(existingEntry.title);
      setContent(existingEntry.content);
      setMood(existingEntry.mood);
      setTags(existingEntry.tags);
      setTagInput('');
    } else {
      setDate(today);
      setTitle('');
      setContent('');
      setMood(3);
      setTags([]);
      setTagInput('');
    }
  }, [existingEntry, today]);

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    const entry: JournalEntry = {
      id: existingEntry?.id || uuidv4(),
      date,
      title: title.trim() || 'Untitled',
      content: content.trim(),
      mood,
      tags,
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
            className={`relative w-full max-w-lg ${
              theme.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${theme.textPrimary}`}>
                {existingEntry ? 'Edit Entry' : 'New Journal Entry'}
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

              {/* Title */}
              <div>
                <label className={`text-sm font-medium ${theme.textSecondary} block mb-1`}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="What's on your mind?"
                  className={`${theme.input} w-full text-sm`}
                  autoFocus
                />
              </div>

              {/* Content */}
              <div>
                <label className={`text-sm font-medium ${theme.textSecondary} block mb-1`}>Content</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write your thoughts..."
                  rows={6}
                  className={`${theme.input} w-full text-sm resize-none`}
                />
              </div>

              {/* Mood */}
              <div>
                <label className={`text-sm font-medium ${theme.textSecondary} block mb-2`}>
                  Mood: {MOOD_LABELS[mood]}
                </label>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      aria-label={`Mood: ${MOOD_LABELS[m]}`}
                      aria-pressed={mood === m}
                      className={`flex-1 py-2 text-lg rounded-lg transition-all ${
                        mood === m
                          ? 'ring-2 ring-blue-500 scale-110'
                          : 'opacity-50 hover:opacity-75'
                      }`}
                    >
                      {MOOD_EMOJIS[m]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className={`text-sm font-medium ${theme.textSecondary} block mb-1`}>Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${
                        theme.isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                        className="hover:opacity-70"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={handleAddTag}
                  placeholder="Add tag (press Enter)"
                  className={`${theme.input} w-full text-sm`}
                />
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={!title.trim() && !content.trim()}
                className="w-full py-2.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
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
