import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header for telemetry
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined. The backend will operate in high-fidelity simulation mode.");
}

// Helper to sanitize any markdown fences if model output is not pristine
function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// API - Workout generator
app.post("/api/generate-workout", async (req, res) => {
  const { goal, location, equipment, duration, level } = req.body;

  if (!ai) {
    // Return high-fidelity fallback
    return res.json({
      simulated: true,
      title: `${level || "Intermediate"} ${goal || "Muscle Gain"} Plan`,
      estimatedCalories: Math.round((duration || 45) * 7.5),
      duration: duration || 45,
      warmup: [
        { exercise: "Dynamic Chest & Arm Swings", duration: "2 mins", instructions: "Swing arms horizontally, stretching the chest." },
        { exercise: "Bodyweight Squats", duration: "2 mins", instructions: "Warm up hips, knees, and ankles with smooth squat motions." },
        { exercise: "Jumping Jacks", duration: "1 min", instructions: "Elevate heart rate and prep cardiovascular system." }
      ],
      mainWorkout: [
        { exercise: location === "Home" ? "Dumbbell Push-Ups to Rows" : "Barbell Bench Press", sets: 4, reps: "10-12", rest: "60s", instructions: "Keep core tight. Push up strongly, pull with control." },
        { exercise: location === "Home" ? "Dumbbell Goblet Squats" : "Barbell Back Squats", sets: 4, reps: "12", rest: "90s", instructions: "Drive hips back, keep chest tall and knees tracking over toes." },
        { exercise: "Dumbbell Overhead Shoulder Press", sets: 3, reps: "10", rest: "60s", instructions: "Press upward fully without arching the lower back." },
        { exercise: location === "Home" ? "Single-Arm Dumbbell Row" : "Lat Pulldown Machine", sets: 3, reps: "12", rest: "60s", instructions: "Pull toward your lower ribs, squeezing your shoulder blades." },
        { exercise: "Plank Hold", sets: 3, reps: "45s", rest: "30s", instructions: "Maintain a straight, rigid body line from head to heels." }
      ],
      cooldown: [
        { exercise: "Seated Hamstring Stretch", duration: "2 mins", instructions: "Reach gently for toes, breathing deeply." },
        { exercise: "Cobra Stretch", duration: "1 min", instructions: "Stretch the abdominal wall and chest, face upward." }
      ],
      weeklyPlan: [
        { day: "Monday", workoutType: "Upper Body Power", focus: "Chest, Back, Shoulders", duration: duration || 45 },
        { day: "Wednesday", workoutType: "Lower Body & Core", focus: "Quads, Hamstrings, Abs", duration: duration || 45 },
        { day: "Friday", workoutType: "Full Body Conditioning", focus: "Metabolic Resistance", duration: duration || 45 }
      ]
    });
  }

  try {
    const prompt = `Generate a highly personalized workout plan with warm-up, main exercises, cool-down, and a weekly layout based on these parameters:
    Goal: ${goal || "General Fitness"}
    Location: ${location || "Gym"}
    Equipment: ${equipment || "Full Equipment"}
    Duration: ${duration || 45} minutes
    Fitness Level: ${level || "Intermediate"}
    
    Ensure the main exercises perfectly fit the selected location (${location}) and equipment (${equipment}). Match the difficulty and sets/reps to the level (${level}). Provide clear instructions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite, encouraging personal trainer and AI fitness coach. Create direct, highly actionable and modern workouts. Ensure the response format strictly adheres to the requested JSON schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "estimatedCalories", "duration", "warmup", "mainWorkout", "cooldown", "weeklyPlan"],
          properties: {
            title: { type: Type.STRING, description: "A catchy and professional workout plan title" },
            estimatedCalories: { type: Type.INTEGER, description: "Estimated total calories burned during this specific workout session" },
            duration: { type: Type.INTEGER, description: "Total duration in minutes" },
            warmup: {
              type: Type.ARRAY,
              description: "List of 2-3 warm-up exercises",
              items: {
                type: Type.OBJECT,
                required: ["exercise", "duration", "instructions"],
                properties: {
                  exercise: { type: Type.STRING },
                  duration: { type: Type.STRING, description: "Duration or reps e.g., '3 mins' or '15 reps'" },
                  instructions: { type: Type.STRING, description: "Brief execution guide" }
                }
              }
            },
            mainWorkout: {
              type: Type.ARRAY,
              description: "List of 4-6 primary workout exercises",
              items: {
                type: Type.OBJECT,
                required: ["exercise", "sets", "reps", "rest", "instructions"],
                properties: {
                  exercise: { type: Type.STRING },
                  sets: { type: Type.INTEGER },
                  reps: { type: Type.STRING, description: "Reps count or duration e.g., '12' or '30s'" },
                  rest: { type: Type.STRING, description: "Rest time e.g., '60s' or '90s'" },
                  instructions: { type: Type.STRING, description: "Form cue or execution instruction" }
                }
              }
            },
            cooldown: {
              type: Type.ARRAY,
              description: "List of 1-2 cool-down stretches",
              items: {
                type: Type.OBJECT,
                required: ["exercise", "duration", "instructions"],
                properties: {
                  exercise: { type: Type.STRING },
                  duration: { type: Type.STRING, description: "Duration e.g., '2 mins'" },
                  instructions: { type: Type.STRING, description: "Brief guide" }
                }
              }
            },
            weeklyPlan: {
              type: Type.ARRAY,
              description: "Recommended weekly schedule (3 key days)",
              items: {
                type: Type.OBJECT,
                required: ["day", "workoutType", "focus", "duration"],
                properties: {
                  day: { type: Type.STRING, description: "e.g., 'Monday'" },
                  workoutType: { type: Type.STRING, description: "Name of training split" },
                  focus: { type: Type.STRING, description: "Target muscle groups" },
                  duration: { type: Type.INTEGER }
                }
              }
            }
          }
        }
      }
    });

    const text = cleanJsonString(response.text || "{}");
    const result = JSON.parse(text);
    res.json(result);
  } catch (error: any) {
    console.error("Gemini Workout Generation Error:", error);
    res.status(500).json({ error: "Failed to generate workout", details: error.message });
  }
});

// API - Meal planner
app.post("/api/generate-meal-plan", async (req, res) => {
  const { isVegetarian, isVegan, allergies, budget, mealsCount, country, cuisine } = req.body;

  if (!ai) {
    // Return high-fidelity fallback
    return res.json({
      simulated: true,
      title: `${cuisine || "Balanced"} Healthy Day Plan`,
      totalCalories: 1850,
      macros: { protein: 125, carbs: 190, fat: 65 },
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
          name: isVegan ? "Crispy Tofu Rice Bowl with Broccoli" : isVegetarian ? "Mediterranean Chickpea & Feta Bowl" : "Lemon Herb Grilled Chicken Bowl",
          calories: 580,
          macros: { protein: 45, carbs: 65, fat: 16 },
          ingredients: isVegan ? ["150g Firm Tofu", "1 cup Brown Rice", "1 cup Steamed Broccoli", "1 tbsp Soy Ginger Dressing"] : ["150g Grilled Chicken Breast", "1 cup Quinoa", "1/2 Avocado", "1 cup Leafy Greens", "Light Lemon Vinaigrette"],
          instructions: "Assemble protein, grains, and greens in a large bowl. Dress and enjoy fresh."
        },
        {
          type: "Dinner",
          name: isVegan ? "Hearty Lentil & Sweet Potato Curry" : "Pan-Seared Salmon with Asparagus",
          calories: 600,
          macros: { protein: 38, carbs: 55, fat: 25 },
          ingredients: isVegan ? ["1 cup Cooked Lentils", "1 Medium Sweet Potato", "1/2 cup Coconut Milk", "Spices"] : ["150g Atlantic Salmon", "1 Bunch Roasted Asparagus", "150g Sweet Potato Mash", "1 tsp Olive Oil"],
          instructions: "Bake or pan-sear salmon and roast asparagus at 400°F for 12-15 mins. Serve alongside seasoned sweet potato mash."
        },
        {
          type: "Snacks",
          name: "Greek Yogurt with Walnuts & Honey",
          calories: 250,
          macros: { protein: 14, carbs: 18, fat: 12 },
          ingredients: ["150g Non-fat Greek Yogurt", "15g Chopped Walnuts", "1 tsp Raw Honey"],
          instructions: "Stir together in a small container. Great for a midday snack."
        }
      ],
      groceryList: [
        "Rolled Oats",
        "Whey or Plant Protein Powder",
        "Mixed Berries",
        "Almond Butter",
        isVegan ? "Firm Tofu" : isVegetarian ? "Chickpeas & Feta" : "Chicken Breast",
        "Quinoa or Brown Rice",
        isVegan ? "Lentils" : "Atlantic Salmon",
        "Sweet Potatoes",
        "Asparagus",
        "Broccoli & Leafy Greens",
        "Greek Yogurt (or Plant Yogurt)",
        "Walnuts"
      ]
    });
  }

  try {
    const dietType = isVegan ? "Vegan" : isVegetarian ? "Vegetarian" : "Non-Vegetarian";
    const prompt = `Generate a customized meal plan for a single day based on these preferences:
    Diet Type: ${dietType}
    Allergies: ${allergies || "None"}
    Daily Budget Level: ${budget || "Medium"}
    Number of Meals: ${mealsCount || 4}
    Country context: ${country || "Global"}
    Preferred Cuisine: ${cuisine || "Healthy Balanced"}
    
    Ensure macronutrient distributions are healthy and tailored, and provide a full consolidated grocery list.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert sports nutritionist. Create premium, delicious, easy-to-cook meal recommendations with correct calorie and macronutrient breakdowns. Strictly adhere to the requested JSON schema output format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "totalCalories", "macros", "meals", "groceryList"],
          properties: {
            title: { type: Type.STRING, description: "A catchy and professional title for the meal plan" },
            totalCalories: { type: Type.INTEGER },
            macros: {
              type: Type.OBJECT,
              required: ["protein", "carbs", "fat"],
              properties: {
                protein: { type: Type.INTEGER, description: "In grams" },
                carbs: { type: Type.INTEGER, description: "In grams" },
                fat: { type: Type.INTEGER, description: "In grams" }
              }
            },
            meals: {
              type: Type.ARRAY,
              description: "Array of daily meals (Breakfast, Lunch, Dinner, Snacks, etc.)",
              items: {
                type: Type.OBJECT,
                required: ["type", "name", "calories", "macros", "ingredients", "instructions"],
                properties: {
                  type: { type: Type.STRING, description: "e.g., 'Breakfast', 'Lunch', 'Dinner', 'Snacks'" },
                  name: { type: Type.STRING },
                  calories: { type: Type.INTEGER },
                  macros: {
                    type: Type.OBJECT,
                    required: ["protein", "carbs", "fat"],
                    properties: {
                      protein: { type: Type.INTEGER },
                      carbs: { type: Type.INTEGER },
                      fat: { type: Type.INTEGER }
                    }
                  },
                  ingredients: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  instructions: { type: Type.STRING, description: "Quick, single-paragraph preparation steps" }
                }
              }
            },
            groceryList: {
              type: Type.ARRAY,
              description: "Consolidated list of ingredients needed for this meal plan",
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = cleanJsonString(response.text || "{}");
    const result = JSON.parse(text);
    res.json(result);
  } catch (error: any) {
    console.error("Gemini Meal Plan Generation Error:", error);
    res.status(500).json({ error: "Failed to generate meal plan", details: error.message });
  }
});

// API - Chat coach conversation
app.post("/api/chat-coach", async (req, res) => {
  const { message, history, profile } = req.body;

  if (!ai) {
    // Return high-fidelity fallback chat message
    let reply = "Hello there! I'm your AI Fitness Coach. I don't have access to my server-side Gemini system at the moment because the GEMINI_API_KEY environment variable is not defined in the workspace secrets. However, I can offer general, high-quality advice:\n\nIf you want to lose fat, aim for a minor calorie deficit (200-500 kcal/day), hit 1.6-2.0g of protein per kg of bodyweight, and keep lifting weights to preserve muscle mass. How can I help you customize your offline routine today?";
    const textLower = (message || "").toLowerCase();
    
    if (textLower.includes("protein")) {
      reply = "Protein is vital! Generally, you need between **1.6 to 2.2 grams of protein per kilogram of bodyweight** (0.7 to 1g per lb) if you are active. For example, a 75kg person needs about 120-165 grams daily. Excellent sources include chicken breast, salmon, eggs, egg whites, Greek yogurt, tofu, lentils, and whey/plant protein powders. Would you like a meal recommendation with high protein?";
    } else if (textLower.includes("dinner") || textLower.includes("recipe") || textLower.includes("dinner suggest")) {
      reply = "Here's a quick, healthy high-protein dinner recommendation: **Pan-Seared Salmon with Steamed Asparagus and Sweet Potato Mash**. It provides approximately 580 kcal, 40g of protein, 45g of complex carbs, and 18g of healthy fats. Season with fresh lemon, garlic, a touch of dill, and 1 tsp of olive oil. Super simple to cook under 15 minutes!";
    } else if (textLower.includes("motivate") || textLower.includes("motivation")) {
      reply = "Remember, consistency beats intensity every single time! You don't have to feel like working out to do it. Action leads to motivation, not the other way around. Just tie your shoes, complete the first 5 minutes of your warm-up, and let the momentum carry you. You've got this, let's crush today's objectives!";
    } else if (textLower.includes("belly fat") || textLower.includes("lose fat")) {
      reply = "Here's the honest truth: spot reduction (losing fat from one specific area) is a biological myth. Fat loss happens systematically across the whole body when you remain in a consistent calorie deficit. To target this effectively: \n\n1. Maintain a high protein intake to preserve lean mass. \n2. Combine strength training 3-4x weekly with active NEAT (e.g. hitting 10k daily steps). \n3. Keep stress levels low and sleep 7-8 hours a night. Consistency is your best friend here!";
    } else if (textLower.includes("today") || textLower.includes("workout do")) {
      reply = "Based on your active goals, a superb routine for today is a **Full Body Resistance Circuit**! You can focus on 4 major moves: Squats, Push-Ups (or Dumbbell Press), Dumbbell rows, and a Core Plank. Complete 3-4 sets of 10-12 controlled reps. This fires up your metabolism, builds strength, and takes less than 40 minutes!";
    }
    
    return res.json({ reply });
  }

  try {
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.sender === "user" ? "user" as const : "model" as const,
      parts: [{ text: msg.text }]
    }));

    // Add profile context if available
    let contextPrompt = "You are FitGen Coach, an elite, motivational, and compassionate AI Personal Trainer.";
    if (profile) {
      contextPrompt += ` The user's profile is: Name: ${profile.name || "User"}, Age: ${profile.age || "N/A"}, Gender: ${profile.gender || "N/A"}, Goal: ${profile.goal || "Fitness"}, Height: ${profile.height || "N/A"}cm, Weight: ${profile.weight || "N/A"}kg, Fitness Level: ${profile.fitnessLevel || "N/A"}, Activity Level: ${profile.activityLevel || "N/A"}. Refer to this data naturally to make recommendations highly personalized, encouraging, and authentic.`;
    }

    const chatSession = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: contextPrompt,
        temperature: 0.7,
      },
      history: formattedHistory.slice(-8) // keep context size small
    });

    const response = await chatSession.sendMessage({ message: message });
    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Coach Error:", error);
    res.status(500).json({ error: "Failed to process message", details: error.message });
  }
});

// Start the Express full-stack server
async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FitGen AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
