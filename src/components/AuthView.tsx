import React, { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, UserPlus, Key, LogIn as GuestIcon, Check, Eye, EyeOff, Sparkles, Mail, Lock, User } from "lucide-react";
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "../lib/firebase";
import { updateProfile } from "firebase/auth";

interface AuthViewProps {
  onAuthSuccess: (userName: string, isGuest: boolean) => void;
}

type AuthMode = "login" | "signup" | "forgot";

export default function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email) {
      setErrorMsg("Please enter an email address.");
      return;
    }
    if (!email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (mode === "login") {
      if (!password) {
        setErrorMsg("Please enter your password.");
        return;
      }
      setIsLoading(true);
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const displayName = user.displayName || user.email?.split("@")[0] || "Athlete";
        onAuthSuccess(displayName.charAt(0).toUpperCase() + displayName.slice(1), false);
      } catch (err: any) {
        console.error("Firebase Login Error:", err);
        let msg = "Failed to sign in. Please check your credentials.";
        if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
          msg = "Incorrect email or password. Please try again.";
        } else if (err.code === "auth/too-many-requests") {
          msg = "Too many login attempts. Please reset your password or try again later.";
        }
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
      }

    } else if (mode === "signup") {
      if (!name) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (!password || password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        return;
      }

      setIsLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        setSuccessMsg("Account created successfully!");
        setTimeout(() => {
          onAuthSuccess(name, false);
        }, 800);
      } catch (err: any) {
        console.error("Firebase Signup Error:", err);
        let msg = "Failed to create account. Please try again.";
        if (err.code === "auth/email-already-in-use") {
          msg = "This email address is already registered.";
        } else if (err.code === "auth/weak-password") {
          msg = "Password should be at least 6 characters.";
        }
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
      }

    } else if (mode === "forgot") {
      setIsLoading(true);
      try {
        await sendPasswordResetEmail(auth, email);
        setSuccessMsg("Reset link has been sent to your email!");
        setTimeout(() => {
          setMode("login");
          setSuccessMsg("");
        }, 2000);
      } catch (err: any) {
        console.error("Firebase Password Reset Error:", err);
        let msg = "Failed to send reset email. Please try again.";
        if (err.code === "auth/user-not-found") {
          msg = "No account found with this email address.";
        }
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      const displayName = user.displayName || "Google Athlete";
      onAuthSuccess(displayName, false);
    } catch (err: any) {
      console.error("Google Sign In Error:", err);
      let msg = "Google Sign-In failed or was cancelled.";
      if (err.code === "auth/popup-blocked") {
        msg = "The authentication popup was blocked. Please enable popups or try again.";
      } else if (err.code === "auth/popup-closed-by-user") {
        msg = "Sign-In window was closed before completion.";
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = () => {
    onAuthSuccess("Guest Athlete", true);
  };

  return (
    <div className="h-full w-full flex flex-col justify-center bg-slate-950 text-slate-100 p-6 relative overflow-y-auto">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* App Branding */}
      <div className="flex flex-col items-center mb-8 relative z-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
          <Sparkles className="w-9 h-9 text-slate-950 fill-slate-950" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-sky-400">
          FitGen AI
        </h1>
        <p className="text-sm text-slate-400 mt-1">Personalized Fitness & Nutrition Coach</p>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl relative z-10">
        <AnimatePresence mode="wait">
          {mode === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-bold text-slate-100 mb-5">Welcome Back</h2>
              
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs font-bold text-sky-400 hover:underline focus:outline-none"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/40 p-3 rounded-xl">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In <LogIn className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center">
                <p className="text-xs text-slate-400">
                  Don't have an account?{" "}
                  <button onClick={() => setMode("signup")} className="text-emerald-400 font-bold hover:underline">
                    Create Account
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {mode === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-bold text-slate-100 mb-5">Create Account</h2>
              
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Johnson"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/40 p-3 rounded-xl">
                    {errorMsg}
                  </p>
                )}

                {successMsg && (
                  <p className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 p-3 rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4" /> {successMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign Up <UserPlus className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center">
                <p className="text-xs text-slate-400">
                  Already have an account?{" "}
                  <button onClick={() => setMode("login")} className="text-emerald-400 font-bold hover:underline">
                    Log In
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {mode === "forgot" && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-bold text-slate-100 mb-2">Forgot Password</h2>
              <p className="text-xs text-slate-400 mb-5">Enter your email and we'll send you instructions to reset your password.</p>
              
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/40 p-3 rounded-xl">
                    {errorMsg}
                  </p>
                )}

                {successMsg && (
                  <p className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 p-3 rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4" /> {successMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Reset Instructions <Key className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center">
                <button onClick={() => setMode("login")} className="text-xs text-emerald-400 font-bold hover:underline">
                  Back to Log In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="my-6 flex items-center justify-center text-xs text-slate-500">
          <div className="flex-1 h-[1px] bg-slate-800" />
          <span className="px-3">OR CONTINUE WITH</span>
          <div className="flex-1 h-[1px] bg-slate-800" />
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 font-bold py-3 rounded-2xl text-sm flex items-center justify-center gap-2.5 transition"
          >
            {/* Real SVG Google Icon */}
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.09 14.99 0 12 0 7.354 0 3.374 2.69 1.468 6.613l3.798 3.152z"
              />
              <path
                fill="#4285F4"
                d="M16.04 15.345c-1.077.732-2.454 1.164-4.04 1.164-3.51 0-6.48-2.373-7.538-5.573L.664 14.088C2.57 18.01 6.55 20.7 11.192 20.7c2.99 0 5.827-1.05 7.9-2.924l-3.052-2.431z"
              />
              <path
                fill="#34A853"
                d="M12 20.7c4.646 0 8.626-2.69 10.532-6.613l-3.798-3.152c-1.058 3.2-4.028 5.573-7.538 5.573H12z"
              />
              <path
                fill="#FBBC05"
                d="M23.51 12c0-.682-.064-1.34-.182-1.973h-11.33V14.65h6.47c-.28 1.492-1.127 2.756-2.382 3.6l3.052 2.431c1.785-1.644 2.89-4.062 2.89-6.682z"
              />
            </svg>
            Sign In with Google
          </button>

          <button
            onClick={handleGuestSignIn}
            disabled={isLoading}
            className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 py-3 rounded-2xl text-sm flex items-center justify-center gap-2 transition"
          >
            <GuestIcon className="w-4 h-4 text-emerald-400" />
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
