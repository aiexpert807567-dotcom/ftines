export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  height: number; // in cm
  weight: number; // in kg
  targetWeight: number; // in kg
  activityLevel: string; // "Sedentary" | "Light" | "Moderate" | "Very Active"
  fitnessLevel: string; // "Beginner" | "Intermediate" | "Advanced"
  goal: string; // "Lose Fat" | "Gain Muscle" | "Maintain Weight" | "Improve Endurance"
}

export interface WorkoutExercise {
  exercise: string;
  sets?: number;
  reps?: string | number;
  rest?: string;
  duration?: string | number;
  instructions: string;
}

export interface WeeklyPlanItem {
  day: string;
  workoutType: string;
  focus: string;
  duration: number;
}

export interface WorkoutPlan {
  title: string;
  estimatedCalories: number;
  duration: number;
  warmup: WorkoutExercise[];
  mainWorkout: WorkoutExercise[];
  cooldown: WorkoutExercise[];
  weeklyPlan: WeeklyPlanItem[];
  generatedAt: string;
}

export interface Meal {
  type: string; // Breakfast, Lunch, Dinner, Snacks
  name: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients: string[];
  instructions: string;
}

export interface MealPlan {
  title: string;
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  meals: Meal[];
  groceryList: string[];
  generatedAt: string;
}

export interface WaterLog {
  id: string;
  amount: number; // in ml or oz
  timestamp: string; // ISO string
}

export interface StepLog {
  date: string; // YYYY-MM-DD
  steps: number;
  calories: number;
  distance: number; // in km or miles
}

export interface WeightLog {
  date: string; // YYYY-MM-DD
  weight: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "coach";
  text: string;
  timestamp: string;
}

export interface AppSettings {
  darkMode: boolean;
  notifications: {
    workout: boolean;
    water: boolean;
    meals: boolean;
    sleep: boolean;
    progress: boolean;
  };
  units: "Metric" | "Imperial";
  language: string;
}
