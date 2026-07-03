import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Apple, RefreshCw, ShoppingCart, Info, Flame, ChevronDown, ChevronUp, Check } from "lucide-react";
import { UserProfile, MealPlan, Meal } from "../types";

interface NutritionViewProps {
  profile: UserProfile;
  mealPlan: MealPlan;
  onSaveMealPlan: (plan: MealPlan) => void;
}

export default function NutritionView({ profile, mealPlan, onSaveMealPlan }: NutritionViewProps) {
  // Plan options
  const [isVegetarian, setIsVegetarian] = useState(profile.goal === "Lose Fat" ? false : true);
  const [isVegan, setIsVegan] = useState(false);
  const [allergies, setAllergies] = useState("");
  const [budget, setBudget] = useState("Medium");
  const [mealsCount, setMealsCount] = useState(4);
  const [country, setCountry] = useState("United States");
  const [cuisine, setCuisine] = useState("Healthy Balanced");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [expandedMealIdx, setExpandedMealIdx] = useState<number | null>(0);
  const [checkedGroceryItems, setCheckedGroceryItems] = useState<string[]>([]);

  // Trigger server-side generation
  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg("");
    setCheckedGroceryItems([]);

    try {
      const response = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVegetarian, isVegan, allergies, budget, mealsCount, country, cuisine })
      });

      if (!response.ok) {
        throw new Error("Server responded with error status");
      }

      const data: MealPlan = await response.json();
      data.generatedAt = new Date().toISOString();
      onSaveMealPlan(data);
    } catch (error: any) {
      console.error("Error generating meal plan:", error);
      setErrorMsg("Failed to communicate with AI Nutritionist server. Loaded offline backup plan.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGroceryItem = (item: string) => {
    if (checkedGroceryItems.includes(item)) {
      setCheckedGroceryItems(checkedGroceryItems.filter(i => i !== item));
    } else {
      setCheckedGroceryItems([...checkedGroceryItems, item]);
    }
  };

  const toggleMealExpand = (idx: number) => {
    setExpandedMealIdx(expandedMealIdx === idx ? null : idx);
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-950 p-4 space-y-4 pb-24 text-slate-100">
      
      {/* Title */}
      <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-3xl border border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">AI Meal Planner</h2>
          <p className="text-xs text-slate-400">Personalized calorie & macro meal guides</p>
        </div>
        <Apple className="w-8 h-8 text-emerald-400" />
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          /* Loading skeleton */
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-6 py-12"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
              <Apple className="w-6 h-6 text-emerald-400 absolute top-5 left-5 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-md font-bold text-slate-200">Formulating Nutrition Metrics</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Calculating metabolic Basal rates (BMR), adjusting macronutrient grams, and assembling recipes tailored to your cuisine preferences...
              </p>
            </div>
            <div className="w-full max-w-xs space-y-2.5 pt-4">
              <div className="h-4 bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-10 bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-20 bg-slate-800 rounded-xl animate-pulse" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form-and-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Planner Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Dietary Profiles</span>

              {/* Switches */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsVegetarian(!isVegetarian);
                    if (isVegan) setIsVegan(false);
                  }}
                  className={`py-2 px-3 rounded-xl border font-bold transition text-center ${isVegetarian ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-slate-950 border-slate-800 text-slate-400"}`}
                >
                  Vegetarian Option
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsVegan(!isVegan);
                    if (!isVegan) setIsVegetarian(true);
                  }}
                  className={`py-2 px-3 rounded-xl border font-bold transition text-center ${isVegan ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-slate-950 border-slate-800 text-slate-400"}`}
                >
                  Strict Vegan
                </button>
              </div>

              {/* Allergies & Budget */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Food Allergies</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Peanuts, Dairy, Gluten..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Grocery Budget</label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none"
                  >
                    <option value="Low">Budget (Thrifty)</option>
                    <option value="Medium">Moderate (Balanced)</option>
                    <option value="High">Premium (Organic)</option>
                  </select>
                </div>
              </div>

              {/* Meals Count & Cuisine */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Meals Per Day</label>
                  <select
                    value={mealsCount}
                    onChange={(e) => setMealsCount(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none"
                  >
                    <option value={3}>3 Meals</option>
                    <option value={4}>4 Meals (Recommended)</option>
                    <option value={5}>5 Meals</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Preferred Cuisine</label>
                  <input
                    type="text"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    placeholder="e.g. Mediterranean, Asian, Mexican..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Country context */}
              <div className="text-xs">
                <label className="text-slate-500 font-semibold block mb-1">Location Context (For Grocery Sourcing)</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United Kingdom, Germany, Canada..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none"
                />
              </div>

              {errorMsg && (
                <p className="text-xxs text-amber-400 bg-amber-950/20 border border-amber-900/30 p-2.5 rounded-xl">
                  {errorMsg}
                </p>
              )}

              <button
                onClick={handleGenerate}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" /> Generate AI Nutrition Plan
              </button>
            </div>

            {/* Generated Meal Plan Output */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg space-y-3">
              
              {/* Header Info */}
              <div className="p-4 bg-gradient-to-r from-emerald-950/20 to-slate-900 border-b border-slate-800">
                <span className="text-xxs uppercase tracking-wider text-emerald-400 font-bold">Active Diet Profile</span>
                <h3 className="text-md font-bold text-white mt-1">{mealPlan.title}</h3>
                
                <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                  <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800/40">
                    <span className="text-slate-500 text-[9px] uppercase font-bold block">Calories</span>
                    <span className="text-xs font-extrabold text-white">{mealPlan.totalCalories} kcal</span>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800/40">
                    <span className="text-rose-400 text-[9px] uppercase font-bold block">Protein</span>
                    <span className="text-xs font-extrabold text-rose-400">{mealPlan.macros.protein}g</span>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800/40">
                    <span className="text-yellow-400 text-[9px] uppercase font-bold block">Carbs</span>
                    <span className="text-xs font-extrabold text-yellow-400">{mealPlan.macros.carbs}g</span>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800/40">
                    <span className="text-sky-400 text-[9px] uppercase font-bold block">Fats</span>
                    <span className="text-xs font-extrabold text-sky-400">{mealPlan.macros.fat}g</span>
                  </div>
                </div>
              </div>

              {/* Meals List */}
              <div className="p-3 space-y-2">
                {mealPlan.meals.map((meal, idx) => (
                  <div key={idx} className="bg-slate-950/40 rounded-2xl border border-slate-800/40 overflow-hidden">
                    <button
                      onClick={() => toggleMealExpand(idx)}
                      className="w-full flex justify-between items-center p-3 text-xs font-bold text-slate-300 hover:bg-slate-900/40 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                        <span className="text-slate-400 uppercase tracking-widest text-[10px] font-extrabold">{meal.type}:</span>
                        <span className="text-slate-200">{meal.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xxs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{meal.calories} kcal</span>
                        {expandedMealIdx === idx ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </div>
                    </button>

                    {expandedMealIdx === idx && (
                      <div className="p-3 pt-0 border-t border-slate-800/20 space-y-3 text-xs text-slate-300">
                        {/* Macros bar */}
                        <div className="flex gap-4 text-xxs text-slate-500 pt-3">
                          <span>P: <strong className="text-rose-400">{meal.macros.protein}g</strong></span>
                          <span>C: <strong className="text-yellow-400">{meal.macros.carbs}g</strong></span>
                          <span>F: <strong className="text-sky-400">{meal.macros.fat}g</strong></span>
                        </div>

                        {/* Ingredients */}
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Required Ingredients:</span>
                          <ul className="list-disc pl-4 space-y-0.5 text-xxs text-slate-300">
                            {meal.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                          </ul>
                        </div>

                        {/* Instructions */}
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Preparation steps:</span>
                          <p className="text-xxs text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-900">
                            {meal.instructions}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Shopping Grocery List Card */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/40">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-extrabold text-slate-200">Consolidated Grocery List</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {mealPlan.groceryList.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => toggleGroceryItem(item)}
                      className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/25 cursor-pointer hover:border-slate-800 transition"
                    >
                      <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${checkedGroceryItems.includes(item) ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-700"}`}>
                        {checkedGroceryItems.includes(item) && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                      </div>
                      <span className={`text-xxs font-semibold ${checkedGroceryItems.includes(item) ? "line-through text-slate-500" : "text-slate-300"}`}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
