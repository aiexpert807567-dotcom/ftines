import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { Scale, Flame, Droplet, Footprints, Calendar, Sparkles } from "lucide-react";
import { UserProfile, WeightLog, StepLog, WaterLog } from "../types";

interface ProgressViewProps {
  profile: UserProfile;
  weightLogs: WeightLog[];
  stepLogs: StepLog[];
  waterLogs: WaterLog[];
}

export default function ProgressView({
  profile,
  weightLogs,
  stepLogs,
  waterLogs,
}: ProgressViewProps) {
  // Sort weight logs chronologically
  const weightData = [...weightLogs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group step logs for bar charts
  const stepData = [...stepLogs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate Streak
  const workoutStreak = 5; // Simulating active streak
  const targetWeightOffset = Math.max(0, profile.weight - profile.targetWeight);

  // Hydration summary
  const totalWaterToday = waterLogs.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-950 p-4 space-y-4 pb-24 text-slate-100">
      {/* Welcome Title */}
      <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-3xl border border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">Fitness Analytics</h2>
          <p className="text-xs text-slate-400 font-sans">Your real-time progress history charts</p>
        </div>
        <Calendar className="w-8 h-8 text-emerald-400" />
      </div>

      {/* Streak and Summary metrics */}
      <div className="grid grid-cols-2 gap-3 font-sans">
        <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/10 p-3.5 rounded-2xl">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Workout Streak</span>
            <Sparkles className="w-4 h-4 text-emerald-400 animate-bounce" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-1.5">{workoutStreak} <span className="text-xs font-normal text-slate-400">days</span></p>
          <span className="text-[9px] text-slate-500 block mt-1">Excellent momentum!</span>
        </div>

        <div className="bg-gradient-to-br from-sky-950/40 to-slate-900 border border-sky-500/10 p-3.5 rounded-2xl">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Hydration State</span>
            <Droplet className="w-4 h-4 text-sky-400 animate-pulse" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-1.5">{totalWaterToday} <span className="text-xs font-normal text-slate-400">ml</span></p>
          <span className="text-[9px] text-slate-500 block mt-1">Today's total logged</span>
        </div>
      </div>

      {/* CHART 1: Weight Progress Chart */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-300 font-sans">Weight Projection (kg)</span>
        </div>

        <div className="h-48 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: '#64748b', fontSize: 9 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '10px' }} />
              <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#weightGrad)" name="Weight (kg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between text-xxs text-slate-500 font-sans">
          <span>Starting: {weightData[0]?.weight || profile.weight} kg</span>
          <span>Target: {profile.targetWeight} kg</span>
          <span className="text-emerald-400 font-bold">Progress: -{targetWeightOffset.toFixed(1)} kg left</span>
        </div>
      </div>

      {/* CHART 2: Step Counter Trends */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3">
        <div className="flex items-center gap-2">
          <Footprints className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-300 font-sans">Daily Steps Walked</span>
        </div>

        <div className="h-44 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stepData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '10px' }} />
              <Bar dataKey="steps" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Steps Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 text-xxs text-slate-500 font-sans">
          <span>Daily Goal: <strong>10,000 steps</strong></span>
          <span className="text-right">Weekly Avg: <strong>{Math.round(stepData.reduce((acc, d) => acc + d.steps, 0) / (stepData.length || 1))} steps</strong></span>
        </div>
      </div>

      {/* CHART 3: Calorie & Cardio Activity */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-bold text-slate-300 font-sans">Calories Burned (Active vs Target)</span>
        </div>

        <div className="h-44 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stepData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '10px' }} />
              <Line type="monotone" dataKey="calories" stroke="#f43f5e" strokeWidth={2.5} dot={{ fill: '#f43f5e', r: 4 }} name="Kcal Burned" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between text-xxs text-slate-500 font-sans">
          <span>Max Burn: {Math.max(...stepData.map((d) => d.calories))} kcal</span>
          <span>Target Active Burn: 400 kcal/day</span>
        </div>
      </div>
    </div>
  );
}
