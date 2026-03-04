import { db, NutritionMealRecord, NutritionFoodItemRecord } from '../db/database';
import { NutritionMeal } from '../types';

function mealRecordToEntry(record: NutritionMealRecord, foodItems: NutritionFoodItemRecord[]): NutritionMeal {
  return {
    ...record,
    foodItems: foodItems.map(fi => ({ ...fi })),
  };
}

class NutritionRepository {
  async getAll(): Promise<NutritionMeal[]> {
    const meals = await db.nutritionMeals.orderBy('date').reverse().toArray();
    const allFoodItems = await db.nutritionFoodItems.toArray();
    const foodItemsByMeal = new Map<string, NutritionFoodItemRecord[]>();
    for (const fi of allFoodItems) {
      const existing = foodItemsByMeal.get(fi.mealId) || [];
      existing.push(fi);
      foodItemsByMeal.set(fi.mealId, existing);
    }
    return meals.map(m => mealRecordToEntry(m, foodItemsByMeal.get(m.id) || []));
  }

  async getByDate(date: string): Promise<NutritionMeal[]> {
    const meals = await db.nutritionMeals.where('date').equals(date).toArray();
    const mealIds = meals.map(m => m.id);
    const foodItems = await db.nutritionFoodItems.toArray();
    const relevantFoodItems = foodItems.filter(fi => mealIds.includes(fi.mealId));
    const foodItemsByMeal = new Map<string, NutritionFoodItemRecord[]>();
    for (const fi of relevantFoodItems) {
      const existing = foodItemsByMeal.get(fi.mealId) || [];
      existing.push(fi);
      foodItemsByMeal.set(fi.mealId, existing);
    }
    return meals.map(m => mealRecordToEntry(m, foodItemsByMeal.get(m.id) || []));
  }

  async create(meal: NutritionMeal): Promise<void> {
    const { foodItems, ...mealData } = meal;
    await db.nutritionMeals.add(mealData);
    if (foodItems.length > 0) {
      await db.nutritionFoodItems.bulkAdd(foodItems);
    }
  }

  async update(meal: NutritionMeal): Promise<void> {
    const { foodItems, ...mealData } = meal;
    await db.nutritionMeals.put(mealData);
    // Replace all food items for this meal
    const existing = await db.nutritionFoodItems.where('mealId').equals(meal.id).toArray();
    const existingIds = existing.map(fi => fi.id);
    if (existingIds.length > 0) {
      await db.nutritionFoodItems.bulkDelete(existingIds);
    }
    if (foodItems.length > 0) {
      await db.nutritionFoodItems.bulkAdd(foodItems);
    }
  }

  async delete(id: string): Promise<void> {
    // Delete meal and its food items
    const foodItems = await db.nutritionFoodItems.where('mealId').equals(id).toArray();
    const foodItemIds = foodItems.map(fi => fi.id);
    if (foodItemIds.length > 0) {
      await db.nutritionFoodItems.bulkDelete(foodItemIds);
    }
    await db.nutritionMeals.delete(id);
  }
}

export const nutritionRepository = new NutritionRepository();
