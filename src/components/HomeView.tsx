import React, { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { Flame, Droplet, Dumbbell, Activity, Scale, Sparkles, Plus, Minus, ArrowRight } from "lucide-react";
import { UserProfile, WorkoutPlan, MealPlan, WaterLog } from "../types";

interface HomeViewProps {
  profile: UserProfile;
  workoutPlan: WorkoutPlan;
  mealPlan: MealPlan;
  waterLogs: WaterLog[];
  weightLogs: { date: string; weight: number }[];
  stepCount: number;
  onAddWater: (amount: number) => void;
  onAddWeight: (weight: number) => void;
  onAddSteps: (steps: number) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function HomeView({
  profile,
  workoutPlan,
  mealPlan,
  waterLogs,
  weightLogs,
  stepCount,
  onAddWater,
  onAddWeight,
  onAddSteps,
  onNavigateToTab,
}: HomeViewProps) {
  const [quickWeight, setQuickWeight] = useState(profile.weight.toString());
  const [quickSteps, setQuickSteps] = useState("");

  // Hydration calculations
  const totalWaterToday = waterLogs.reduce((sum, item) => sum + item.amount, 0);
  const waterGoal = profile.gender === "Female" ? 2500 : 3000; // in ml
  const waterProgress = Math.min((totalWaterToday / waterGoal) * 100, 100);

  // BMI calculations
  const heightInMeters = profile.height / 100;
  const bmi = profile.weight / (heightInMeters * heightInMeters);
  let bmiCategory = "Normal";
  let bmiColor = "text-emerald-400";
  let bmiBg = "bg-emerald-500/10";

  if (bmi < 18.5) {
    bmiCategory = "Underweight";
    bmiColor = "text-amber-400";
    bmiBg = "bg-amber-500/10";
  } else if (bmi >= 25 && bmi < 29.9) {
    bmiCategory = "Overweight";
    bmiColor = "text-amber-400";
    bmiBg = "bg-amber-500/10";
  } else if (bmi >= 29.9) {
    bmiCategory = "Obese";
    bmiColor = "text-red-400";
    bmiBg = "bg-red-500/10";
  }

  // Nutrition calculations
  const calorieGoal = profile.goal === "Lose Fat" ? 1800 : profile.goal === "Gain Muscle" ? 2800 : 2200;
  const mealCalories = mealPlan.meals.reduce((sum, m) => sum + m.calories, 0);

  // Dynamic AI tip based on goal and profile
  const getAiTip = () => {
    switch (profile.goal) {
      case "Lose Fat":
        return `Hey ${profile.name}, prioritize drinking water before meals and hit your 10,000 steps today. This simple habit keeps your metabolism elevated and controls cortisol levels!`;
      case "Gain Muscle":
        return `Focus on high-quality sleep tonight, ${profile.name}. Your muscles require recovery time to synthesize protein and rebuild stronger after your ${workoutPlan.duration}m training session!`;
      case "Improve Endurance":
        return `Hydration is key today. Keep refueling electrolytes and aim to hit your aerobic thresholds during your intervals!`;
      default:
        return `Stay consistent! Every single step, glass of water, and workout brings you closer to your optimal health. Keep up the high energy!`;
    }
  };

  const handleWeightSubmit = (e: FormEvent) => {
    e.preventDefault();
    const w = parseFloat(quickWeight);
    if (!isNaN(w) && w > 20 && w < 300) {
      onAddWeight(w);
      alert(`Logged: ${w} kg`);
    }
  };

  const handleStepSubmit = (e: FormEvent) => {
    e.preventDefault();
    const s = parseInt(quickSteps);
    if (!isNaN(s) && s >= 0 && s < 100000) {
      onAddSteps(s);
      setQuickSteps("");
      alert(`Added ${s} steps!`);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-950 p-4 space-y-4 pb-24">
      {/* Welcome Header */}
      <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-3xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <span className="text-xs text-slate-500 font-medium">Welcome Back, Athlete</span>
          <h2 className="text-xl font-bold text-white tracking-tight">{profile.name}</h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 font-extrabold text-sm">
          {profile.name.substring(0, 2).toUpperCase()}
        </div>
      </div>

      {/* Dynamic AI Tip Header Card */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-sky-950/40 border border-emerald-500/15 p-4 rounded-3xl relative overflow-hidden"
      >
        <div className="flex gap-3 relative z-10">
          <div className="p-2.5 h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-slate-950 flex items-center justify-center">
            <Sparkles className="w-5 h-5 fill-slate-950" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              FitGen Coach Prompt
            </h4>
            <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-medium">
              "{getAiTip()}"
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-full blur-2xl pointer-events-none" />
      </motion.div>

      {/* Grid containing Trackers */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Calories Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <Flame className="w-5 h-5 fill-rose-400/20" />
            </div>
            <button 
              onClick={() => onNavigateToTab("Nutrition")}
              className="text-slate-500 hover:text-slate-300 transition"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-400 block font-medium">Daily Calories</span>
            <span className="text-lg font-bold text-white">{mealCalories} <span className="text-xs font-normal text-slate-500">/ {calorieGoal} kcal</span></span>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((mealCalories / calorieGoal) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Water Tracker Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
              <Droplet className="w-5 h-5 fill-sky-400/20" />
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => onAddWater(-250)}
                disabled={totalWaterToday <= 0}
                className="p-1 text-slate-400 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg transition"
              >
                <Minus className="w-3h-3" />
              </button>
              <button 
                onClick={() => onAddWater(250)}
                className="p-1 text-emerald-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-400 block font-medium">Water Intake</span>
            <span className="text-lg font-bold text-white">{totalWaterToday} <span className="text-xs font-normal text-slate-500">/ {waterGoal} ml</span></span>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-sky-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${waterProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* BMI Calculator Widget */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col justify-between col-span-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-300">BMI Analytics</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${bmiBg} ${bmiColor}`}>
              {bmiCategory}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 items-end">
            <div>
              <span className="text-xxs uppercase tracking-wider text-slate-500 block">Your BMI</span>
              <span className="text-xl font-bold text-white">{bmi.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-xxs uppercase tracking-wider text-slate-500 block">Height</span>
              <span className="text-sm font-semibold text-slate-200">{profile.height} cm</span>
            </div>
            <div>
              <span className="text-xxs uppercase tracking-wider text-slate-500 block">Weight</span>
              <span className="text-sm font-semibold text-slate-200">{profile.weight} kg</span>
            </div>
          </div>
        </div>

        {/* Step Tracker Manual Entry Widget */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl col-span-2 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-300">Daily Steps Activity</span>
            <span className="text-xs font-bold text-emerald-400">{stepCount.toLocaleString()} steps</span>
          </div>
          <form onSubmit={handleStepSubmit} className="flex gap-2">
            <input
              type="number"
              value={quickSteps}
              onChange={(e) => setQuickSteps(e.target.value)}
              placeholder="e.g. 1500 steps"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Log
            </button>
          </form>
          <div className="flex gap-4 text-xxs text-slate-400 pt-1 justify-between">
            <span>Distance: <strong>{(stepCount * 0.00075).toFixed(2)} km</strong></span>
            <span>Est. Burned: <strong>{Math.round(stepCount * 0.04)} kcal</strong></span>
          </div>
        </div>

        {/* Today's Workout Snap Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl col-span-2 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Dumbbell className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-300">Today's Workout Plan</span>
            </div>
            <button 
              onClick={() => onNavigateToTab("Workout")}
              className="text-emerald-400 text-xs font-bold hover:underline"
            >
              Start Plan
            </button>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/40">
            <p className="text-xs font-bold text-white">{workoutPlan.title}</p>
            <div className="flex justify-between text-xxs text-slate-500 mt-2">
              <span>Duration: <strong>{workoutPlan.duration} mins</strong></span>
              <span>Est. Burned: <strong>{workoutPlan.estimatedCalories} kcal</strong></span>
            </div>
          </div>
        </div>

        {/* Weight Progression Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <Scale className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-300">Weight Tracking Logs</span>
          </div>

          <form onSubmit={handleWeightSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                step="0.1"
                value={quickWeight}
                onChange={(e) => setQuickWeight(e.target.value)}
                placeholder="Weight in kg"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-3 top-1.5 text-xs text-slate-500">kg</span>
            </div>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl font-bold text-xs"
            >
              Log Weight
            </button>
          </form>

          <div className="flex justify-between items-center text-xxs text-slate-400 pt-1">
            <span>Current: <strong>{profile.weight} kg</strong></span>
            <span>Target: <strong>{profile.targetWeight} kg</strong></span>
            <span className="text-emerald-400">Remaining: <strong>{Math.max(0, profile.weight - profile.targetWeight).toFixed(1)} kg</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
}
