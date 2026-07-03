import { UserProfile, WorkoutPlan, MealPlan, AppSettings, WeightLog, StepLog, WaterLog } from "./types";

export const DEFAULT_PROFILE: UserProfile = {
  name: "Alex Johnson",
  age: 28,
  gender: "Male",
  height: 178, // cm
  weight: 82, // kg
  targetWeight: 76, // kg
  activityLevel: "Moderate",
  fitnessLevel: "Intermediate",
  goal: "Lose Fat"
};

export const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  notifications: {
    workout: true,
    water: true,
    meals: true,
    sleep: false,
    progress: true
  },
  units: "Metric",
  language: "English"
};

export const DEFAULT_WORKOUT: WorkoutPlan = {
  title: "FitGen Daily Fat Burn & Conditioning",
  estimatedCalories: 340,
  duration: 40,
  warmup: [
    { exercise: "Dynamic Arm Circles & Chest Expansion", duration: "2 mins", instructions: "Perform slow, controlled arm circles while opening up the chest." },
    { exercise: "Bodyweight Air Squats", duration: "12 reps", instructions: "Keep torso upright and drive through heels to warm up the hips and knees." },
    { exercise: "High Knees", duration: "45 seconds", instructions: "Lightly jog in place, bringing knees up to hip height to raise your heart rate." }
  ],
  mainWorkout: [
    { exercise: "Dumbbell Goblet Squats", sets: 3, reps: 12, rest: "60s", instructions: "Hold a dumbbell vertically at your chest. Sit back and press straight up." },
    { exercise: "Push-Ups (or Incline Push-Ups)", sets: 3, reps: "10-15", rest: "60s", instructions: "Maintain a strict plank. Lower your chest to the floor and push back up." },
    { exercise: "Dumbbell Bent-Over Row", sets: 3, reps: 12, rest: "60s", instructions: "Hinge at the hips, flat back. Pull dumbbell to lower chest, squeezing shoulder blades." },
    { exercise: "Dumbbell Romanian Deadlifts", sets: 3, reps: 12, rest: "60s", instructions: "Soft bend in knees. Hinge forward at the hips, keeping weights close to shins." },
    { exercise: "Plank to Shoulder Taps", sets: 3, reps: "20 taps", rest: "45s", instructions: "Hold a strong plank. Alternately tap opposite shoulders without rocking hips." }
  ],
  cooldown: [
    { exercise: "Static Hamstring & Quad Stretch", duration: "2 mins", instructions: "Hold each stretch for 30 seconds on both sides, breathing deeply." },
    { exercise: "Child's Pose", duration: "1.5 mins", instructions: "Sit back on heels, stretch arms forward, and press forehead into the mat." }
  ],
  weeklyPlan: [
    { day: "Monday", workoutType: "Upper Body Sculpt", focus: "Chest, Back, Arms", duration: 45 },
    { day: "Wednesday", workoutType: "Lower Body & Core Focus", focus: "Quads, Glutes, Abs", duration: 40 },
    { day: "Friday", workoutType: "Full Body Fat Burn Circuit", focus: "Metabolic Conditioning", duration: 35 }
  ],
  generatedAt: new Date().toISOString()
};

export const DEFAULT_MEAL_PLAN: MealPlan = {
  title: "Balanced Shred & Sustained Energy",
  totalCalories: 1850,
  macros: { protein: 135, carbs: 180, fat: 65 },
  meals: [
    {
      type: "Breakfast",
      name: "High-Protein Berry Oatmeal Bowl",
      calories: 420,
      macros: { protein: 28, carbs: 52, fat: 12 },
      ingredients: ["1/2 cup Rolled Oats", "1 scoop Vanilla Whey Protein", "1/2 cup Mixed Berries", "1 tbsp Almond Butter", "1 cup Unsweetened Almond Milk"],
      instructions: "Cook oats in almond milk. Stir in protein powder post-heating. Top with fresh berries and drizzle almond butter."
    },
    {
      type: "Lunch",
      name: "Lemon Herb Grilled Chicken Bowl",
      calories: 580,
      macros: { protein: 45, carbs: 65, fat: 16 },
      ingredients: ["150g Grilled Chicken Breast", "1 cup Quinoa", "1/2 Avocado", "1 cup Leafy Greens", "Light Lemon Vinaigrette"],
      instructions: "Assemble protein, grains, and greens in a large bowl. Dress and enjoy fresh."
    },
    {
      type: "Dinner",
      name: "Pan-Seared Salmon with Asparagus",
      calories: 600,
      macros: { protein: 42, carbs: 45, fat: 25 },
      ingredients: ["150g Atlantic Salmon", "1 Bunch Roasted Asparagus", "150g Sweet Potato Mash", "1 tsp Olive Oil"],
      instructions: "Bake or pan-sear salmon and roast asparagus at 400°F for 12-15 mins. Serve alongside seasoned sweet potato mash."
    },
    {
      type: "Snacks",
      name: "Greek Yogurt with Walnuts & Honey",
      calories: 250,
      macros: { protein: 20, carbs: 18, fat: 12 },
      ingredients: ["150g Non-fat Greek Yogurt", "15g Chopped Walnuts", "1 tsp Raw Honey"],
      instructions: "Stir together in a small container. Great for a midday snack."
    }
  ],
  groceryList: [
    "Rolled Oats",
    "Whey or Plant Protein Powder",
    "Mixed Berries",
    "Almond Butter",
    "Chicken Breast",
    "Quinoa or Brown Rice",
    "Atlantic Salmon",
    "Sweet Potatoes",
    "Asparagus",
    "Broccoli & Leafy Greens",
    "Greek Yogurt (or Plant Yogurt)",
    "Walnuts"
  ],
  generatedAt: new Date().toISOString()
};

export const INITIAL_WEIGHT_LOGS: WeightLog[] = [
  { date: "2026-06-25", weight: 84.2 },
  { date: "2026-06-27", weight: 83.5 },
  { date: "2026-06-29", weight: 82.9 },
  { date: "2026-07-01", weight: 82.4 },
  { date: "2026-07-03", weight: 82.0 }
];

export const INITIAL_STEP_LOGS: StepLog[] = [
  { date: "2026-06-27", steps: 7500, calories: 310, distance: 5.2 },
  { date: "2026-06-28", steps: 9200, calories: 380, distance: 6.4 },
  { date: "2026-06-29", steps: 11000, calories: 450, distance: 7.7 },
  { date: "2026-06-30", steps: 8400, calories: 350, distance: 5.9 },
  { date: "2026-07-01", steps: 10500, calories: 430, distance: 7.3 },
  { date: "2026-07-02", steps: 12100, calories: 510, distance: 8.5 },
  { date: "2026-07-03", steps: 9600, calories: 400, distance: 6.7 }
];

export const INITIAL_WATER_LOGS: WaterLog[] = [
  { id: "1", amount: 250, timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString() },
  { id: "2", amount: 500, timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
  { id: "3", amount: 250, timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString() }
];

export const INITIAL_CHAT: string[] = [
  "Hi, I am FitGen AI, your personalized fitness and nutrition companion! 🏋️‍♂️🥗",
  "How can I help you reach your goals today? You can ask me to suggest a workout, explain a meal's nutritional value, or write a motivational quote!",
];
