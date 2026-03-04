import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Apple, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { NutritionMeal } from '../../types';
import { useNutritionStore } from '../../stores/nutritionStore';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { NutritionMealModal } from './NutritionMealModal';
import { NutritionStats } from './NutritionStats';

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const MEAL_TYPE_COLORS: Record<string, string> = {
  breakfast: 'bg-yellow-500/20 text-yellow-500',
  lunch: 'bg-green-500/20 text-green-500',
  dinner: 'bg-blue-500/20 text-blue-500',
  snack: 'bg-purple-500/20 text-purple-500',
};

export const NutritionPage: React.FC = () => {
  const { entries, isLoading, loadEntries, addEntry, updateEntry, deleteEntry } = useNutritionStore();
  const theme = useThemeClasses();
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<NutritionMeal | undefined>();

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleSave = async (meal: NutritionMeal) => {
    if (editingEntry) {
      await updateEntry(meal);
    } else {
      await addEntry(meal);
    }
    setEditingEntry(undefined);
  };

  const handleEdit = (meal: NutritionMeal) => {
    setEditingEntry(meal);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
  };

  const handleOpenNew = () => {
    setEditingEntry(undefined);
    setShowModal(true);
  };

  // Group by date
  const sortedEntries = [...entries].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    const order = ['breakfast', 'lunch', 'dinner', 'snack'];
    return order.indexOf(a.mealType) - order.indexOf(b.mealType);
  });

  // Group entries by date
  const groupedByDate = sortedEntries.reduce<Record<string, NutritionMeal[]>>((acc, meal) => {
    if (!acc[meal.date]) acc[meal.date] = [];
    acc[meal.date].push(meal);
    return acc;
  }, {});

  const dateGroups = Object.entries(groupedByDate).slice(0, 7);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`w-8 h-8 border-4 ${
          theme.isDark ? 'border-gray-700 border-t-orange-400' : 'border-gray-200 border-t-orange-600'
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
          <Apple className={`w-5 h-5 ${theme.isDark ? 'text-orange-400' : 'text-orange-600'}`} />
          <h1 className={`text-xl font-semibold ${theme.textPrimary}`}>Nutrition</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenNew}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Log Meal
        </motion.button>
      </div>

      {/* Today's Stats */}
      <NutritionStats entries={entries} />

      {/* Meals by date */}
      {dateGroups.length === 0 ? (
        <div className={`text-center py-12 ${theme.textMuted}`}>
          <Apple className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No nutrition data yet</p>
          <p className="text-xs mt-1">Tap "Log Meal" to start tracking</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dateGroups.map(([date, meals]) => {
            const dayCalories = meals.reduce((s, m) => s + m.totalCalories, 0);
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-sm font-medium ${theme.textSecondary}`}>
                    {format(new Date(date + 'T12:00:00'), 'EEEE, MMM d')}
                  </h3>
                  <span className={`text-xs ${theme.textMuted}`}>{dayCalories} cal</span>
                </div>
                <div className="space-y-2">
                  {meals.map((meal, i) => (
                    <motion.div
                      key={meal.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        theme.isDark ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
                      } border ${theme.isDark ? 'border-gray-700/50' : 'border-gray-200'} transition-colors`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          MEAL_TYPE_COLORS[meal.mealType]
                        }`}>
                          {MEAL_TYPE_LABELS[meal.mealType]}
                        </span>
                        <div>
                          <div className={`text-sm font-medium ${theme.textPrimary}`}>{meal.name}</div>
                          <div className={`text-xs ${theme.textMuted}`}>
                            {meal.totalCalories} cal &middot; P:{meal.totalProtein}g C:{meal.totalCarbs}g F:{meal.totalFat}g
                            {meal.foodItems.length > 0 && ` · ${meal.foodItems.length} items`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEdit(meal)}
                          aria-label={`Edit meal for ${meal.date}`}
                          className={`p-1.5 rounded-md ${
                            theme.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          } transition-colors`}
                        >
                          <Edit2 className={`w-3.5 h-3.5 ${theme.textMuted}`} />
                        </button>
                        <button
                          onClick={() => handleDelete(meal.id)}
                          aria-label={`Delete meal for ${meal.date}`}
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
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <NutritionMealModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingEntry(undefined);
        }}
        onSave={handleSave}
        existingMeal={editingEntry}
      />
    </motion.div>
  );
};
