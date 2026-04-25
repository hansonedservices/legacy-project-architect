"use client";

import { useState } from "react";
import { Feather, User, GraduationCap, BookOpen, Shield } from "lucide-react";
import { saveUser, type UserProfile, type UserRole } from "@/lib/userStore";

interface Props {
  onComplete: (profile: UserProfile) => void;
}

const ROLES: { value: UserRole; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "student",
    label: "Student",
    description: "I'm here to debate and learn",
    icon: <GraduationCap size={18} />,
  },
  {
    value: "teacher",
    label: "Teacher",
    description: "I'm facilitating a class session",
    icon: <BookOpen size={18} />,
  },
  {
    value: "administrator",
    label: "Administrator",
    description: "I'm managing the platform",
    icon: <Shield size={18} />,
  },
];

export default function UserAuth({ onComplete }: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name to continue.");
      return;
    }
    if (trimmed.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    const profile: UserProfile = {
      id: crypto.randomUUID(),
      name: trimmed,
      role,
      createdAt: new Date().toISOString(),
    };
    saveUser(profile);
    onComplete(profile);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-parchment-texture px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-crimson flex items-center justify-center mb-3 shadow-parchment">
            <Feather size={24} className="text-white" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-blue">The Legacy Project</h1>
          <p className="text-sm text-slate-400 mt-1">Williamsburg Academy</p>
        </div>

        {/* Card */}
        <div className="parchment-card rounded-xl p-8 shadow-parchment-lg">
          <div className="mb-6">
            <h2 className="font-serif text-xl font-semibold text-slate-blue mb-1">
              Create your profile
            </h2>
            <p className="text-sm text-slate-500">
              Your name and role will appear in your debate transcripts and be saved locally on this device.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Your Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  placeholder="e.g. Alex Johnson"
                  maxLength={60}
                  className="legacy-input pl-9 w-full"
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-crimson mt-1">{error}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Your Role
              </label>
              <div className="space-y-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all ${
                      role === r.value
                        ? "border-crimson bg-crimson/5 text-crimson"
                        : "border-ivory-border bg-ivory hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <span className={role === r.value ? "text-crimson" : "text-slate-400"}>
                      {r.icon}
                    </span>
                    <div>
                      <div className="text-sm font-semibold leading-none mb-0.5">{r.label}</div>
                      <div className="text-xs text-slate-400">{r.description}</div>
                    </div>
                    <div className="ml-auto">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        role === r.value ? "border-crimson" : "border-ivory-border"
                      }`}>
                        {role === r.value && (
                          <div className="w-2 h-2 rounded-full bg-crimson" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-crimson w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Feather size={15} />
              Enter the Archive
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Your profile is saved locally on this device only — no account or password required.
        </p>
      </div>
    </div>
  );
}
