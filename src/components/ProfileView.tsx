import { useState, FormEvent } from "react";
import { User, Settings, ShieldCheck, Mail, Sliders, LogOut, Trash2, Smartphone, Bell, Eye, HelpCircle } from "lucide-react";
import { UserProfile, AppSettings } from "../types";

interface ProfileViewProps {
  profile: UserProfile;
  settings: AppSettings;
  onUpdateProfile: (p: UserProfile) => void;
  onUpdateSettings: (s: AppSettings) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export default function ProfileView({
  profile,
  settings,
  onUpdateProfile,
  onUpdateSettings,
  onLogout,
  onDeleteAccount,
}: ProfileViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "settings" | "playstore">("profile");

  // Profile Fields Local State
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState(profile.gender);
  const [height, setHeight] = useState(profile.height);
  const [weight, setWeight] = useState(profile.weight);
  const [targetWeight, setTargetWeight] = useState(profile.targetWeight);
  const [activityLevel, setActivityLevel] = useState(profile.activityLevel);
  const [fitnessLevel, setFitnessLevel] = useState(profile.fitnessLevel);
  const [goal, setGoal] = useState(profile.goal);

  // App Settings Toggles
  const toggleDarkMode = () => {
    onUpdateSettings({ ...settings, darkMode: !settings.darkMode });
  };

  const toggleNotification = (key: keyof AppSettings["notifications"]) => {
    const updatedNotifications = { ...settings.notifications, [key]: !settings.notifications[key] };
    onUpdateSettings({ ...settings, notifications: updatedNotifications });
  };

  const handleUnitChange = (units: "Metric" | "Imperial") => {
    onUpdateSettings({ ...settings, units });
  };

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      targetWeight: Number(targetWeight),
      activityLevel,
      fitnessLevel,
      goal,
    });
    alert("Profile saved successfully!");
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-950 p-4 space-y-4 pb-24 text-slate-100">
      
      {/* Profile Header Block */}
      <div className="flex flex-col items-center bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800/80 text-center space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/30 text-emerald-400 font-black text-xl">
          {profile.name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="text-md font-bold text-white">{profile.name}</h3>
          <p className="text-xxs text-emerald-400 font-bold uppercase tracking-wider">{profile.goal}</p>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 w-full max-w-xs text-xxs font-bold">
          <button
            onClick={() => setActiveSubTab("profile")}
            className={`flex-1 py-1.5 rounded-lg transition ${activeSubTab === "profile" ? "bg-slate-900 text-emerald-400 border border-slate-800" : "text-slate-500"}`}
          >
            Profile Data
          </button>
          <button
            onClick={() => setActiveSubTab("settings")}
            className={`flex-1 py-1.5 rounded-lg transition ${activeSubTab === "settings" ? "bg-slate-900 text-emerald-400 border border-slate-800" : "text-slate-500"}`}
          >
            App Options
          </button>
          <button
            onClick={() => setActiveSubTab("playstore")}
            className={`flex-1 py-1.5 rounded-lg transition ${activeSubTab === "playstore" ? "bg-slate-900 text-emerald-400 border border-slate-800" : "text-slate-500"}`}
          >
            Google Play
          </button>
        </div>
      </div>

      {/* Profile Edit Form Tab */}
      {activeSubTab === "profile" && (
        <form onSubmit={handleProfileSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200">Adjust Physical Specs</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-500 font-semibold block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Target (kg)</label>
                <input
                  type="number"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-500 font-semibold block mb-1">Primary Fitness Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Lose Fat">Lose Fat (Shred)</option>
                <option value="Gain Muscle">Gain Muscle (Bulk)</option>
                <option value="Maintain Weight">Maintain Weight (Tone)</option>
                <option value="Improve Endurance">Improve Endurance (Stamina)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Sedentary">Sedentary</option>
                  <option value="Light">Lightly Active</option>
                  <option value="Moderate">Moderately Active</option>
                  <option value="Very Active">Very Active</option>
                </select>
              </div>
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Fitness Tier</label>
                <select
                  value={fitnessLevel}
                  onChange={(e) => setFitnessLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl shadow-lg mt-4 transition"
          >
            Save Physical specs
          </button>
        </form>
      )}

      {/* Profile Settings Options Tab */}
      {activeSubTab === "settings" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200">Device Settings</span>
          </div>

          {/* Dark Mode toggle */}
          <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-800/40">
            <div>
              <span className="font-bold block">Dark Theme Mode</span>
              <span className="text-xxs text-slate-500">Enable comfortable nighttime viewing</span>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-11 h-6 rounded-full p-1 transition duration-300 focus:outline-none ${settings.darkMode ? "bg-emerald-500" : "bg-slate-800"}`}
            >
              <div className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition duration-300 ${settings.darkMode ? "translate-x-5" : ""}`} />
            </button>
          </div>

          {/* Units Selection */}
          <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-800/40">
            <div>
              <span className="font-bold block">Measurement Units</span>
              <span className="text-xxs text-slate-500">Metric system (kg/cm) vs Imperial (lb/in)</span>
            </div>
            <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-xl text-xxs font-bold">
              <button
                onClick={() => handleUnitChange("Metric")}
                className={`px-2.5 py-1 rounded-lg transition ${settings.units === "Metric" ? "bg-emerald-500 text-slate-950" : "text-slate-400"}`}
              >
                Metric
              </button>
              <button
                onClick={() => handleUnitChange("Imperial")}
                className={`px-2.5 py-1 rounded-lg transition ${settings.units === "Imperial" ? "bg-emerald-500 text-slate-950" : "text-slate-400"}`}
              >
                Imperial
              </button>
            </div>
          </div>

          {/* Notifications Toggles */}
          <div className="space-y-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-emerald-400" /> Notifications & Reminders
            </span>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/40 space-y-3">
              {(Object.keys(settings.notifications) as Array<keyof AppSettings["notifications"]>).map((key) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="capitalize text-xxs text-slate-300 font-bold">{key} Intake Reminders</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications[key]}
                    onChange={() => toggleNotification(key)}
                    className="accent-emerald-500 h-4 w-4 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Legal / Policy */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/40 space-y-2.5">
            <span className="text-xxs text-slate-400 font-bold block mb-1">Company Policies</span>
            <div className="flex justify-between text-xxs text-slate-500 hover:text-slate-300 cursor-pointer">
              <span>Privacy Agreement</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="flex justify-between text-xxs text-slate-500 hover:text-slate-300 cursor-pointer">
              <span>Terms of Use</span>
              <Sliders className="w-3.5 h-3.5 text-sky-500" />
            </div>
            <div className="flex justify-between text-xxs text-slate-500 hover:text-slate-300 cursor-pointer">
              <span>Support Desk Inquiry</span>
              <Mail className="w-3.5 h-3.5 text-rose-500" />
            </div>
          </div>

          {/* Account deletion and logouts */}
          <div className="pt-3 space-y-2">
            <button
              onClick={onLogout}
              className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-rose-400 font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <LogOut className="w-4 h-4" /> Sign Out Athlete
            </button>
            <button
              onClick={onDeleteAccount}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Trash2 className="w-4 h-4" /> Terminate Account
            </button>
          </div>
        </div>
      )}

      {/* Play Store Publishing Guide Center Tab */}
      {activeSubTab === "playstore" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4 text-xs font-sans">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200">Google Play Publishing Center</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/40 space-y-2">
            <span className="text-[10px] uppercase font-extrabold text-emerald-400 block tracking-wider">Release Info</span>
            <div className="grid grid-cols-2 gap-2 text-xxs text-slate-400">
              <span>App Identifier:</span>
              <strong className="text-slate-200 text-right">com.fitgen.ai</strong>
              <span>App Name:</span>
              <strong className="text-slate-200 text-right">FitGen AI</strong>
              <span>Target Version:</span>
              <strong className="text-slate-200 text-right">1.0.0 (Build 1)</strong>
              <span>Target SDK:</span>
              <strong className="text-slate-200 text-right">Android 14 (API 34)</strong>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/40 space-y-2 leading-relaxed">
            <span className="text-[10px] uppercase font-extrabold text-sky-400 block tracking-wider">Publishing Steps Checklist</span>
            <ul className="list-decimal pl-4 text-xxs text-slate-400 space-y-2">
              <li>
                <strong className="text-slate-200">Key Store Generation:</strong> Use keytool to generate a secure release key store:
                <pre className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-[9px] text-emerald-400 mt-1 font-mono overflow-x-auto">
                  keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
                </pre>
              </li>
              <li>
                <strong className="text-slate-200">Build Signed Applet:</strong> Add the signing config coordinates in your <code className="text-emerald-400 font-mono text-[10px]">build.gradle</code>:
                <pre className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-[9px] text-emerald-400 mt-1 font-mono overflow-x-auto">
{`signingConfigs {
    release {
        storeFile file("my-release-key.jks")
        storePassword "keystore_password"
        keyAlias "my-key-alias"
        keyPassword "alias_password"
    }
}`}
                </pre>
              </li>
              <li>
                <strong className="text-slate-200">Google Console Upload:</strong> Export your compiled release bundle <code className="text-emerald-400 font-mono text-[10px]">app-release.aab</code> and submit it to the Closed Testing or Production tracks in Google Play Console.
              </li>
            </ul>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/40 flex gap-2.5 items-start">
            <HelpCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xxs text-slate-400 leading-normal">
              <strong>Need a Kotlin Project Template?</strong> Click settings in the workspace to export this full React codebase, or wrap it using WebView/Cordova wrappers for immediate Google Play Store publishing!
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
