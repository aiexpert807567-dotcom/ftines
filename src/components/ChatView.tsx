import React, { useState, useRef, useEffect, FormEvent } from "react";
import { Send, Sparkles, User, Dumbbell, Play, ArrowLeft } from "lucide-react";
import { ChatMessage, UserProfile } from "../types";

interface ChatViewProps {
  profile: UserProfile;
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isGenerating: boolean;
}

export default function ChatView({
  profile,
  chatHistory,
  onSendMessage,
  isGenerating,
}: ChatViewProps) {
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const presets = [
    { text: "What exercises should I do today?", icon: "🏋️‍♂️" },
    { text: "How much protein do I need?", icon: "🥩" },
    { text: "How can I lose belly fat?", icon: "🔥" },
    { text: "Suggest a healthy dinner.", icon: "🥗" },
    { text: "Motivate me to work out.", icon: "⚡" }
  ];

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handlePresetClick = (presetText: string) => {
    if (isGenerating) return;
    onSendMessage(presetText);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isGenerating]);

  return (
    <div className="h-full w-full flex flex-col bg-slate-950 text-slate-100 relative">
      
      {/* Top Banner */}
      <div className="flex items-center gap-3 bg-slate-900/60 p-4 border-b border-slate-800/80 shrink-0">
        <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <Sparkles className="w-4.5 h-4.5 text-emerald-400 fill-emerald-500/10" />
        </div>
        <div>
          <h3 className="text-xs font-extrabold text-white">FitGen AI Personal Coach</h3>
          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Coach Online
          </span>
        </div>
      </div>

      {/* Messages Scrollbox */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        
        {/* Helper Greeting Card */}
        {chatHistory.length <= 2 && (
          <div className="bg-gradient-to-br from-emerald-950/20 via-slate-900 to-sky-950/20 border border-emerald-500/10 p-4 rounded-2xl text-center space-y-2.5 max-w-sm mx-auto my-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-slate-950 flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Meet FitGen Coach</h4>
              <p className="text-xxs text-slate-400 mt-1 leading-normal px-2">
                Ask me details about customized macros, full-body resistance circuits, fat loss strategies, or nutrition instructions anytime!
              </p>
            </div>
          </div>
        )}

        {/* Message elements */}
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            {/* Avatar */}
            <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${msg.sender === "user" ? "bg-slate-800 text-slate-300" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"}`}>
              {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            </div>

            {/* Bubble */}
            <div className={`p-3 rounded-2xl text-xxs leading-relaxed font-sans ${msg.sender === "user" ? "bg-emerald-500 text-slate-950 rounded-tr-none font-bold shadow-md shadow-emerald-500/5" : "bg-slate-900 text-slate-200 border border-slate-800/80 rounded-tl-none"}`}>
              <p className="whitespace-pre-line">{msg.text}</p>
              <span className={`block text-[8px] mt-1 text-right ${msg.sender === "user" ? "text-slate-950/60" : "text-slate-500"}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isGenerating && (
          <div className="flex items-start gap-2.5 max-w-[85%] mr-auto">
            <div className="w-7.5 h-7.5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/25">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl rounded-tl-none flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Preset Quick Actions (floating on top of input) */}
      <div className="absolute bottom-16 left-0 right-0 p-3 overflow-x-auto whitespace-nowrap bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex gap-2 scrollbar-none pointer-events-auto shrink-0 z-15">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handlePresetClick(preset.text)}
            className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xxs font-semibold text-slate-300 px-3 py-1.5 rounded-xl transition duration-200"
          >
            <span>{preset.icon}</span>
            <span>{preset.text}</span>
          </button>
        ))}
      </div>

      {/* Input Form footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-slate-950 border-t border-slate-900 z-20 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isGenerating}
            placeholder={isGenerating ? "Coach is thinking..." : "Ask Coach (e.g. suggest high-protein dinner)"}
            className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-xxs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition disabled:opacity-55"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isGenerating}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 p-3 rounded-xl flex items-center justify-center transition"
          >
            <Send className="w-4 h-4 fill-slate-950 stroke-slate-950" />
          </button>
        </form>
      </div>

    </div>
  );
}
