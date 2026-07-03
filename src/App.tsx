import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home as HomeIcon, 
  Dumbbell, 
  Apple, 
  TrendingUp, 
  User as UserIcon, 
  MessageSquareCode, 
  Wifi, 
  Battery, 
  Signal,
  Sparkles
} from "lucide-react";
import { auth, db, onAuthStateChanged, signOut } from "./lib/firebase";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

// Types
import { 
  UserProfile, 
  WorkoutPlan, 
  MealPlan, 
  WaterLog, 
  StepLog, 
  WeightLog, 
  ChatMessage, 
  AppSettings 
} from "./types";

// Data Presets
import { 
  DEFAULT_PROFILE, 
  DEFAULT_SETTINGS, 
  DEFAULT_WORKOUT, 
  DEFAULT_MEAL_PLAN, 
  INITIAL_WEIGHT_LOGS, 
  INITIAL_STEP_LOGS, 
  INITIAL_WATER_LOGS,
  INITIAL_CHAT
} from "./data";

// Sub-views
import OnboardingView from "./components/OnboardingView";
import AuthView from "./components/AuthView";
import HomeView from "./components/HomeView";
import WorkoutView from "./components/WorkoutView";
import NutritionView from "./components/NutritionView";
import ProgressView from "./components/ProgressView";
import ProfileView from "./components/ProfileView";
import ChatView from "./components/ChatView";

export default function App() {
  // ----------------------------------------
  // State Initialization from LocalStorage
  // ----------------------------------------
  
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem("fitgen_onboarded") === "true";
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("fitgen_logged_in") === "true";
  });

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem("fitgen_username") || "Athlete";
  });

  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem("fitgen_is_guest") === "true";
  });

  const [activeTab, setActiveTab] = useState<string>("Home");
  const [showChatOverlay, setShowChatOverlay] = useState<boolean>(false);

  // Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("fitgen_profile");
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("fitgen_settings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Workouts
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan>(() => {
    const saved = localStorage.getItem("fitgen_workout_plan");
    return saved ? JSON.parse(saved) : DEFAULT_WORKOUT;
  });

  // Meal Plan
  const [mealPlan, setMealPlan] = useState<MealPlan>(() => {
    const saved = localStorage.getItem("fitgen_meal_plan");
    return saved ? JSON.parse(saved) : DEFAULT_MEAL_PLAN;
  });

  // Logs
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => {
    const saved = localStorage.getItem("fitgen_water_logs");
    return saved ? JSON.parse(saved) : INITIAL_WATER_LOGS;
  });

  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(() => {
    const saved = localStorage.getItem("fitgen_weight_logs");
    return saved ? JSON.parse(saved) : INITIAL_WEIGHT_LOGS;
  });

  const [stepLogs, setStepLogs] = useState<StepLog[]>(() => {
    const saved = localStorage.getItem("fitgen_step_logs");
    return saved ? JSON.parse(saved) : INITIAL_STEP_LOGS;
  });

  // Active steps count for today
  const [currentStepsToday, setCurrentStepsToday] = useState<number>(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem("fitgen_step_logs");
    if (saved) {
      const parsed: StepLog[] = JSON.parse(saved);
      const match = parsed.find(l => l.date === todayStr);
      if (match) return match.steps;
    }
    return 9600; // fallback standard initial steps
  });

  // Chat Coach History
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("fitgen_chat_history");
    if (saved) return JSON.parse(saved);
    
    // Default initial greeting message
    return INITIAL_CHAT.map((text, idx) => ({
      id: `init-${idx}`,
      sender: "coach" as const,
      text,
      timestamp: new Date(Date.now() - (INITIAL_CHAT.length - idx) * 60000).toISOString()
    }));
  });

  const [isGeneratingChat, setIsGeneratingChat] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("09:41");

  // Firebase auth & firestore states
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState<boolean>(false);

  // Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setIsGuest(false);
        setUserName(user.displayName || user.email?.split("@")[0] || "Athlete");
        
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.profile) setProfile(data.profile);
            if (data.settings) setSettings(data.settings);
            if (data.workoutPlan) setWorkoutPlan(data.workoutPlan);
            if (data.mealPlan) setMealPlan(data.mealPlan);
            if (data.waterLogs) setWaterLogs(data.waterLogs);
            if (data.weightLogs) setWeightLogs(data.weightLogs);
            if (data.stepLogs) setStepLogs(data.stepLogs);
            if (data.chatHistory) setChatHistory(data.chatHistory);
            if (data.currentStepsToday !== undefined) setCurrentStepsToday(data.currentStepsToday);
            if (data.isOnboarded !== undefined) setIsOnboarded(data.isOnboarded);
          } else {
            // First-time user (e.g. newly signed up or Google Auth first login)
            // Initialize document with current local/default states
            await setDoc(docRef, {
              profile,
              settings,
              workoutPlan,
              mealPlan,
              waterLogs,
              weightLogs,
              stepLogs,
              chatHistory,
              currentStepsToday,
              isOnboarded,
              updatedAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error("Error syncing Firestore user document:", err);
        } finally {
          setIsFirebaseLoaded(true);
        }
      } else {
        // Not authenticated
        setIsFirebaseLoaded(false);
      }
      setIsAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // ----------------------------------------
  // Effects to synchronize with LocalStorage and Firebase Firestore
  // ----------------------------------------
  useEffect(() => {
    if (isLoggedIn && !isGuest && isFirebaseLoaded && auth.currentUser) {
      const docRef = doc(db, "users", auth.currentUser.uid);
      updateDoc(docRef, { isOnboarded }).catch((err) => console.error("Error saving isOnboarded to Firebase:", err));
    }
    localStorage.setItem("fitgen_onboarded", String(isOnboarded));
  }, [isOnboarded, isLoggedIn, isGuest, isFirebaseLoaded]);

  useEffect(() => {
    localStorage.setItem("fitgen_logged_in", String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem("fitgen_username", userName);
  }, [userName]);

  useEffect(() => {
    if (!isLoggedIn) {
      setIsFirebaseLoaded(false);
    }
    localStorage.setItem("fitgen_is_guest", String(isGuest));
  }, [isGuest, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && !isGuest && isFirebaseLoaded && auth.currentUser) {
      const docRef = doc(db, "users", auth.currentUser.uid);
      updateDoc(docRef, { profile }).catch((err) => console.error("Error saving profile to Firebase:", err));
    }
    localStorage.setItem("fitgen_profile", JSON.stringify(profile));
  }, [profile, isLoggedIn, isGuest, isFirebaseLoaded]);

  useEffect(() => {
    if (isLoggedIn && !isGuest && isFirebaseLoaded && auth.currentUser) {
      const docRef = doc(db, "users", auth.currentUser.uid);
      updateDoc(docRef, { settings }).catch((err) => console.error("Error saving settings to Firebase:", err));
    }
    localStorage.setItem("fitgen_settings", JSON.stringify(settings));
  }, [settings, isLoggedIn, isGuest, isFirebaseLoaded]);

  useEffect(() => {
    if (isLoggedIn && !isGuest && isFirebaseLoaded && auth.currentUser) {
      const docRef = doc(db, "users", auth.currentUser.uid);
      updateDoc(docRef, { workoutPlan }).catch((err) => console.error("Error saving workoutPlan to Firebase:", err));
    }
    localStorage.setItem("fitgen_workout_plan", JSON.stringify(workoutPlan));
  }, [workoutPlan, isLoggedIn, isGuest, isFirebaseLoaded]);

  useEffect(() => {
    if (isLoggedIn && !isGuest && isFirebaseLoaded && auth.currentUser) {
      const docRef = doc(db, "users", auth.currentUser.uid);
      updateDoc(docRef, { mealPlan }).catch((err) => console.error("Error saving mealPlan to Firebase:", err));
    }
    localStorage.setItem("fitgen_meal_plan", JSON.stringify(mealPlan));
  }, [mealPlan, isLoggedIn, isGuest, isFirebaseLoaded]);

  useEffect(() => {
    if (isLoggedIn && !isGuest && isFirebaseLoaded && auth.currentUser) {
      const docRef = doc(db, "users", auth.currentUser.uid);
      updateDoc(docRef, { waterLogs }).catch((err) => console.error("Error saving waterLogs to Firebase:", err));
    }
    localStorage.setItem("fitgen_water_logs", JSON.stringify(waterLogs));
  }, [waterLogs, isLoggedIn, isGuest, isFirebaseLoaded]);

  useEffect(() => {
    if (isLoggedIn && !isGuest && isFirebaseLoaded && auth.currentUser) {
      const docRef = doc(db, "users", auth.currentUser.uid);
      updateDoc(docRef, { weightLogs }).catch((err) => console.error("Error saving weightLogs to Firebase:", err));
    }
    localStorage.setItem("fitgen_weight_logs", JSON.stringify(weightLogs));
  }, [weightLogs, isLoggedIn, isGuest, isFirebaseLoaded]);

  useEffect(() => {
    if (isLoggedIn && !isGuest && isFirebaseLoaded && auth.currentUser) {
      const docRef = doc(db, "users", auth.currentUser.uid);
      updateDoc(docRef, { stepLogs, currentStepsToday }).catch((err) => console.error("Error saving steps activity to Firebase:", err));
    }
    localStorage.setItem("fitgen_step_logs", JSON.stringify(stepLogs));
  }, [stepLogs, currentStepsToday, isLoggedIn, isGuest, isFirebaseLoaded]);

  useEffect(() => {
    if (isLoggedIn && !isGuest && isFirebaseLoaded && auth.currentUser) {
      const docRef = doc(db, "users", auth.currentUser.uid);
      updateDoc(docRef, { chatHistory }).catch((err) => console.error("Error saving chatHistory to Firebase:", err));
    }
    localStorage.setItem("fitgen_chat_history", JSON.stringify(chatHistory));
  }, [chatHistory, isLoggedIn, isGuest, isFirebaseLoaded]);

  // Handle dark mode DOM sync
  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [settings.darkMode]);

  // Real-time Status clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hrs = now.getHours().toString().padStart(2, "0");
      const mins = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hrs}:${mins}`);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // ----------------------------------------
  // User Event Handlers
  // ----------------------------------------

  const handleOnboardingFinish = () => {
    setIsOnboarded(true);
  };

  const handleAuthSuccess = (name: string, guest: boolean) => {
    setUserName(name);
    setIsGuest(guest);
    
    // Prefill profile name if empty
    if (profile.name === DEFAULT_PROFILE.name) {
      setProfile(prev => ({ ...prev, name }));
    }
    
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase Signout Error:", err);
    }
    setIsLoggedIn(false);
    setIsGuest(false);
    setUserName("Athlete");
    setActiveTab("Home");
    setShowChatOverlay(false);
    setIsFirebaseLoaded(false);
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you absolutely sure you want to permanently delete your FitGen AI account profile data? This action is irreversible.")) {
      if (auth.currentUser) {
        try {
          const docRef = doc(db, "users", auth.currentUser.uid);
          await deleteDoc(docRef);
          await auth.currentUser.delete();
        } catch (err) {
          console.error("Failed to delete user cloud records:", err);
        }
      }
      localStorage.clear();
      setIsOnboarded(false);
      setIsLoggedIn(false);
      setIsGuest(false);
      setProfile(DEFAULT_PROFILE);
      setSettings(DEFAULT_SETTINGS);
      setWorkoutPlan(DEFAULT_WORKOUT);
      setMealPlan(DEFAULT_MEAL_PLAN);
      setWaterLogs(INITIAL_WATER_LOGS);
      setWeightLogs(INITIAL_WEIGHT_LOGS);
      setStepLogs(INITIAL_STEP_LOGS);
      setCurrentStepsToday(9600);
      setChatHistory([]);
      setIsFirebaseLoaded(false);
      alert("Account terminated. All data deleted.");
    }
  };

  // Water tracking increment
  const handleAddWater = (amount: number) => {
    const newLog: WaterLog = {
      id: `w-${Date.now()}`,
      amount,
      timestamp: new Date().toISOString()
    };
    setWaterLogs(prev => [...prev, newLog]);
  };

  // Weight Logging
  const handleAddWeight = (weight: number) => {
    const todayStr = new Date().toISOString().split("T")[0];
    
    // Update profile weight
    setProfile(prev => ({ ...prev, weight }));

    // Append/Overwrite Weight Log
    setWeightLogs(prev => {
      const filtered = prev.filter(l => l.date !== todayStr);
      return [...filtered, { date: todayStr, weight }].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });
  };

  // Steps Logging
  const handleAddSteps = (steps: number) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const updatedTotal = currentStepsToday + steps;
    setCurrentStepsToday(updatedTotal);

    setStepLogs(prev => {
      const filtered = prev.filter(l => l.date !== todayStr);
      const calories = Math.round(updatedTotal * 0.04);
      const distance = Number((updatedTotal * 0.00075).toFixed(2));
      return [...filtered, { date: todayStr, steps: updatedTotal, calories, distance }].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });
  };

  // Send message to AI Chat Coach on the server
  const handleSendChatMessage = async (text: string) => {
    // 1. Add user message locally
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setIsGeneratingChat(true);

    try {
      const response = await fetch("/api/chat-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatHistory,
          profile: profile
        })
      });

      if (!response.ok) {
        throw new Error("Chat server error");
      }

      const data = await response.json();
      
      const coachMsg: ChatMessage = {
        id: `c-${Date.now()}`,
        sender: "coach",
        text: data.reply,
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, coachMsg]);
    } catch (err) {
      console.error("Chat message delivery failed:", err);
      // Fallback response
      const fallbackMsg: ChatMessage = {
        id: `c-err-${Date.now()}`,
        sender: "coach",
        text: "I am experiencing temporary connection latency with the main AI brain. However, please continue staying consistent! Drink water, stick to your protein counts, and lift with controlled progressive overload.",
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, fallbackMsg]);
    } finally {
      setIsGeneratingChat(false);
    }
  };

  // Render Inner views inside phone shell
  const renderTabContent = () => {
    switch (activeTab) {
      case "Home":
        return (
          <HomeView
            profile={profile}
            workoutPlan={workoutPlan}
            mealPlan={mealPlan}
            waterLogs={waterLogs}
            weightLogs={weightLogs}
            stepCount={currentStepsToday}
            onAddWater={handleAddWater}
            onAddWeight={handleAddWeight}
            onAddSteps={handleAddSteps}
            onNavigateToTab={setActiveTab}
          />
        );
      case "Workout":
        return (
          <WorkoutView
            profile={profile}
            workoutPlan={workoutPlan}
            onSaveWorkout={setWorkoutPlan}
          />
        );
      case "Nutrition":
        return (
          <NutritionView
            profile={profile}
            mealPlan={mealPlan}
            onSaveMealPlan={setMealPlan}
          />
        );
      case "Progress":
        return (
          <ProgressView
            profile={profile}
            weightLogs={weightLogs}
            stepLogs={stepLogs}
            waterLogs={waterLogs}
          />
        );
      case "Profile":
        return (
          <ProfileView
            profile={profile}
            settings={settings}
            onUpdateProfile={setProfile}
            onUpdateSettings={setSettings}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
          />
        );
      default:
        return <div className="p-4 text-center text-slate-400 text-xs">View Not Found</div>;
    }
  };

  // Master Orchestrator: Select screen based on onboarding/auth sequence
  const getScreenComponent = () => {
    if (isAuthChecking || (isLoggedIn && !isGuest && !isFirebaseLoaded)) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6">
          <div className="relative flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6 animate-pulse">
              <Sparkles className="w-9 h-9 text-slate-950 fill-slate-950" />
            </div>
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs text-slate-400 font-mono tracking-wider uppercase animate-pulse">Syncing Cloud Profile...</p>
          </div>
        </div>
      );
    }
    if (!isOnboarded) {
      return <OnboardingView onFinish={handleOnboardingFinish} />;
    }
    if (!isLoggedIn) {
      return <AuthView onAuthSuccess={handleAuthSuccess} />;
    }
    return (
      <div className="h-full w-full flex flex-col justify-between relative bg-slate-950 overflow-hidden">
        {/* Core View Container */}
        <div className="flex-1 w-full overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-full w-full overflow-hidden"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>

          {/* AI CHAT OVERLAY DRAWER */}
          <AnimatePresence>
            {showChatOverlay && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="absolute inset-0 z-40 bg-slate-950"
              >
                {/* Close handle top panel */}
                <div className="absolute top-0 right-0 left-0 h-10 bg-transparent flex items-center justify-center cursor-pointer z-50" onClick={() => setShowChatOverlay(false)}>
                  <div className="w-12 h-1.5 bg-slate-800 rounded-full mt-2.5 hover:bg-slate-700 transition" />
                </div>
                <div className="h-full pt-6">
                  <ChatView
                    profile={profile}
                    chatHistory={chatHistory}
                    onSendMessage={handleSendChatMessage}
                    isGenerating={isGeneratingChat}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Chat Floating Action Button (FAB) */}
        {!showChatOverlay && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowChatOverlay(true)}
            className="absolute bottom-20 right-5 z-30 w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-500 text-slate-950 shadow-lg shadow-emerald-500/15 flex items-center justify-center cursor-pointer border border-white/10"
          >
            <MessageSquareCode className="w-5.5 h-5.5 fill-slate-950 stroke-slate-950" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-400"></span>
            </span>
          </motion.button>
        )}

        {/* BOTTOM NAVIGATION PANEL (Material 3) */}
        <div className="bg-slate-900 border-t border-slate-850 shrink-0 px-2 py-1.5 relative z-30">
          <div className="grid grid-cols-5 gap-1 text-center">
            
            {/* Home Tab */}
            <button
              onClick={() => {
                setActiveTab("Home");
                setShowChatOverlay(false);
              }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${activeTab === "Home" && !showChatOverlay ? "text-emerald-400 font-bold" : "text-slate-500"}`}
            >
              <HomeIcon className="w-5 h-5" />
              <span className="text-[9px] mt-1 tracking-wide">Home</span>
            </button>

            {/* Workout Tab */}
            <button
              onClick={() => {
                setActiveTab("Workout");
                setShowChatOverlay(false);
              }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${activeTab === "Workout" && !showChatOverlay ? "text-emerald-400 font-bold" : "text-slate-500"}`}
            >
              <Dumbbell className="w-5 h-5" />
              <span className="text-[9px] mt-1 tracking-wide">Workout</span>
            </button>

            {/* Nutrition Tab */}
            <button
              onClick={() => {
                setActiveTab("Nutrition");
                setShowChatOverlay(false);
              }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${activeTab === "Nutrition" && !showChatOverlay ? "text-emerald-400 font-bold" : "text-slate-500"}`}
            >
              <Apple className="w-5 h-5" />
              <span className="text-[9px] mt-1 tracking-wide">Nutrition</span>
            </button>

            {/* Progress Tab */}
            <button
              onClick={() => {
                setActiveTab("Progress");
                setShowChatOverlay(false);
              }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${activeTab === "Progress" && !showChatOverlay ? "text-emerald-400 font-bold" : "text-slate-500"}`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-[9px] mt-1 tracking-wide">Progress</span>
            </button>

            {/* Profile Tab */}
            <button
              onClick={() => {
                setActiveTab("Profile");
                setShowChatOverlay(false);
              }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${activeTab === "Profile" && !showChatOverlay ? "text-emerald-400 font-bold" : "text-slate-500"}`}
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-[9px] mt-1 tracking-wide">Profile</span>
            </button>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center overflow-x-hidden relative font-sans text-slate-200">
      
      {/* Background radial overlays */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Desktop side companion details */}
      <div className="hidden lg:flex flex-col justify-center max-w-sm mr-16 space-y-6 shrink-0 z-10 select-none">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Sparkles className="w-6.5 h-6.5 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-sky-400 font-sans">
              FitGen AI
            </h1>
            <p className="text-xs text-slate-500">Android Interactive Preview</p>
          </div>
        </div>

        <div className="bg-slate-950/60 p-5 rounded-3xl border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-white">Full-Stack AI Sports Coach</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Experience the full layout of the Android FitGen application. Features an interactive three-stage onboarding loop, real-time BMI evaluation, hydration tracking progress, and secure server-proxied Gemini fitness advice.
          </p>
          <div className="text-xxs text-slate-500 pt-2 border-t border-slate-850 flex justify-between">
            <span>Identifier: com.fitgen.ai</span>
            <span>Version: 1.0.0</span>
          </div>
        </div>
      </div>

      {/* Android Device Shell Container */}
      <div className="w-full h-screen sm:h-[820px] sm:w-[410px] sm:rounded-[50px] sm:border-[12px] sm:border-slate-800 sm:shadow-2xl overflow-hidden relative bg-slate-950 shrink-0 z-20 flex flex-col justify-between sm:ring-8 sm:ring-slate-900">
        
        {/* Android Phone Status Bar */}
        <div className="h-9 w-full bg-slate-950 shrink-0 flex justify-between items-center px-6 text-xxs text-slate-400 font-semibold z-40 select-none">
          <span>{currentTime}</span>
          
          {/* Camera Notch placeholder */}
          <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-slate-900 border border-slate-950 rounded-full" />

          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 stroke-[1.5px]" />
          </div>
        </div>

        {/* Dynamic App View Screen */}
        <div className="flex-1 w-full overflow-hidden relative bg-slate-950">
          {getScreenComponent()}
        </div>

        {/* Standard Android Soft Keys (Navigation gesture placeholder) */}
        <div className="hidden sm:flex h-6 w-full bg-slate-950 shrink-0 justify-around items-center px-16 pb-1 select-none z-35">
          <div className="w-2.5 h-2.5 border-l-2 border-b-2 border-slate-600 transform rotate-45" />
          <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-600" />
          <div className="w-3 h-3 border-2 border-slate-600 rounded-sm" />
        </div>

      </div>

    </div>
  );
}
