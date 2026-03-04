import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { NutritionMeal, NutritionFoodItem } from '../../types';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { v4 as uuidv4 } from 'uuid';

interface NutritionMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: NutritionMeal) => void;
  existingMeal?: NutritionMeal;
}

const MEAL_TYPES = [
  { value: 'breakfast' as const, label: 'Breakfast' },
  { value: 'lunch' as const, label: 'Lunch' },
  { value: 'dinner' as const, label: 'Dinner' },
  { value: 'snack' as const, label: 'Snack' },
];

interface FoodItemForm {
  id: string;
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  servingSize: string;
}

const emptyFoodItem = (): FoodItemForm => ({
  id: uuidv4(),
  name: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  servingSize: '',
});

export const NutritionMealModal: React.FC<NutritionMealModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingMeal,
}) => {
  const theme = useThemeClasses();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [date, setDate] = useState(today);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [foodItems, setFoodItems] = useState<FoodItemForm[]>([emptyFoodItem()]);

  useEffect(() => {
    if (existingMeal) {
      setDate(existingMeal.date);
      setMealType(existingMeal.mealType);
      setName(existingMeal.name);
      setNotes(existingMeal.notes || '');
      setFoodItems(
        existingMeal.foodItems.length > 0
          ? existingMeal.foodItems.map(fi => ({
              id: fi.id,
              name: fi.name,
              calories: fi.calories.toString(),
              protein: fi.protein.toString(),
              carbs: fi.carbs.toString(),
              fat: fi.fat.toString(),
              servingSize: fi.servingSize || '',
            }))
          : [emptyFoodItem()]
      );
    } else {
      setDate(today);
      setMealType('lunch');
      setName('');
      setNotes('');
      setFoodItems([emptyFoodItem()]);
    }
  }, [existingMeal, today]);

  const addFoodItem = () => {
    setFoodItems([...foodItems, emptyFoodItem()]);
  };

  const removeFoodItem = (index: number) => {
    if (foodItems.length <= 1) return;
    setFoodItems(foodItems.filter((_, i) => i !== index));
  };

  const updateFoodItem = (index: number, field: keyof FoodItemForm, value: string) => {
    const updated = [...foodItems];
    updated[index] = { ...updated[index], [field]: value };
    setFoodItems(updated);
  };

  const handleSave = () => {
    const mealId = existingMeal?.id || uuidv4();
    const validFoodItems: NutritionFoodItem[] = foodItems
      .filter(fi => fi.name.trim())
      .map(fi => ({
        id: fi.id,
        mealId,
        name: fi.name.trim(),
        calories: parseInt(fi.calories) || 0,
        protein: parseInt(fi.protein) || 0,
        carbs: parseInt(fi.carbs) || 0,
        fat: parseInt(fi.fat) || 0,
        servingSize: fi.servingSize.trim() || undefined,
        createdAt: new Date(),
      }));

    const totalCalories = validFoodItems.reduce((s, fi) => s + fi.calories, 0);
    const totalProtein = validFoodItems.reduce((s, fi) => s + fi.protein, 0);
    const totalCarbs = validFoodItems.reduce((s, fi) => s + fi.carbs, 0);
    const totalFat = validFoodItems.reduce((s, fi) => s + fi.fat, 0);

    const meal: NutritionMeal = {
      id: mealId,
      date,
      mealType,
      name: name.trim() || `${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`,
      notes: notes.trim() || undefined,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      foodItems: validFoodItems,
      createdAt: existingMeal?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(meal);
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
                {existingMeal ? 'Edit Meal' : 'Log Meal'}
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

              {/* Meal Type */}
              <div>
                <label className={`text-sm font-medium ${theme.textSecondary} block mb-2`}>Meal Type</label>
                <div className="flex gap-2">
                  {MEAL_TYPES.map(mt => (
                    <button
                      key={mt.value}
                      onClick={() => setMealType(mt.value)}
                      aria-label={`Meal type: ${mt.label}`}
                      aria-pressed={mealType === mt.value}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                        mealType === mt.value
                          ? 'bg-orange-500 text-white'
                          : theme.isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {mt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meal Name */}
              <div>
                <label className={`text-sm font-medium ${theme.textSecondary} block mb-1`}>
                  Meal Name (optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={`e.g. Chicken salad`}
                  className={`${theme.input} w-full text-sm`}
                />
              </div>

              {/* Food Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-sm font-medium ${theme.textSecondary}`}>Food Items</label>
                  <button
                    onClick={addFoodItem}
                    className={`text-xs flex items-center gap-1 ${
                      theme.isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                    }`}
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {foodItems.map((fi, idx) => (
                    <div
                      key={fi.id}
                      className={`p-3 rounded-lg ${
                        theme.isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                      } space-y-2`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={fi.name}
                          onChange={e => updateFoodItem(idx, 'name', e.target.value)}
                          placeholder="Food name"
                          className={`${theme.input} flex-1 text-sm`}
                        />
                        {foodItems.length > 1 && (
                          <button
                            onClick={() => removeFoodItem(idx)}
                            aria-label={`Remove ${fi.name || 'food item'}`}
                            className={`p-1 ${theme.isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} rounded`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className={`text-[10px] ${theme.textMuted} block`}>Cal</label>
                          <input
                            type="number"
                            min={0}
                            value={fi.calories}
                            onChange={e => updateFoodItem(idx, 'calories', e.target.value)}
                            className={`${theme.input} w-full text-xs`}
                          />
                        </div>
                        <div>
                          <label className={`text-[10px] ${theme.textMuted} block`}>Protein</label>
                          <input
                            type="number"
                            min={0}
                            value={fi.protein}
                            onChange={e => updateFoodItem(idx, 'protein', e.target.value)}
                            className={`${theme.input} w-full text-xs`}
                          />
                        </div>
                        <div>
                          <label className={`text-[10px] ${theme.textMuted} block`}>Carbs</label>
                          <input
                            type="number"
                            min={0}
                            value={fi.carbs}
                            onChange={e => updateFoodItem(idx, 'carbs', e.target.value)}
                            className={`${theme.input} w-full text-xs`}
                          />
                        </div>
                        <div>
                          <label className={`text-[10px] ${theme.textMuted} block`}>Fat</label>
                          <input
                            type="number"
                            min={0}
                            value={fi.fat}
                            onChange={e => updateFoodItem(idx, 'fat', e.target.value)}
                            className={`${theme.input} w-full text-xs`}
                          />
                        </div>
                      </div>
                    </div>
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
                  placeholder="Any notes about this meal"
                  rows={2}
                  className={`${theme.input} w-full text-sm resize-none`}
                />
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {existingMeal ? 'Update' : 'Save'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
