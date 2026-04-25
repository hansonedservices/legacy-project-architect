"use client";

import { useState, useEffect } from "react";
import { BookOpen, Feather, ChevronDown, LogOut, Clock, User } from "lucide-react";
import CurriculumIngestor, { type CurriculumSource } from "@/components/CurriculumIngestor";
import PersonaStitcher, { type PersonaBlueprint } from "@/components/PersonaStitcher";
import LegacyArena from "@/components/LegacyArena";
import UserAuth from "@/components/UserAuth";
import {
  getLocalUserId,
  clearLocalUser,
  fetchProfile,
  fetchHistory,
  saveDebateSession,
  type UserProfile,
  type DebateRecord,
} from "@/lib/userStore";

type AppStage = "loading" | "auth" | "configure" | "simulate";

const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  teacher: "Teacher",
  administrator: "Administrator",
};

const MODE_LABELS: Record<string, string> = {
  solo: "Sage Speaks",
  debate: "Student Debates",
  dual: "Dual-Persona",
};

export default function Home() {
  const [stage, setStage] = useState<AppStage>("loading");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumSource>(null);
  const [blueprint, setBlueprint] = useState<PersonaBlueprint | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [history, setHistory] = useState<DebateRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // On mount, check localStorage for user ID then fetch from Supabase
  useEffect(() => {
    const id = getLocalUserId();
    if (!id) { setStage("auth"); return; }
    Promise.all([fetchProfile(id), fetchHistory(id)]).then(([profile, history]) => {
      if (profile) {
        setUser(profile);
        setHistory(history);
        setStage("configure");
      } else {
        clearLocalUser();
        setStage("auth");
      }
    });
  }, []);

  const handleAuthComplete = (profile: UserProfile) => {
    setUser(profile);
    setHistory([]);
    setStage("configure");
  };

  const handleBlueprintReady = (bp: PersonaBlueprint) => {
    setBlueprint(bp);
    setStage("simulate");
  };

  const handleReset = (messageCount = 0) => {
    if (blueprint && messageCount > 0 && user) {
      const record = {
        figureIcon: blueprint.figure.icon,
        figureName: blueprint.figure.name,
        dilemma: blueprint.dilemma.label,
        mode: blueprint.mode,
        messageCount,
        grounded: !!curriculum,
      };
      saveDebateSession(user.id, record);
      setHistory((prev) => [{ ...record, id: crypto.randomUUID(), date: new Date().toISOString() }, ...prev]);
    }
    setBlueprint(null);
    setCurriculum(null);
    setStage("configure");
  };

  const handleSignOut = () => {
    clearLocalUser();
    setUser(null);
    setHistory([]);
    setBlueprint(null);
    setCurriculum(null);
    setShowUserMenu(false);
    setShowHistory(false);
    setStage("auth");
  };

  if (stage === "loading") return null;

  if (stage === "auth") {
    return <UserAuth onComplete={handleAuthComplete} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-parchment-texture" onClick={() => setShowUserMenu(false)}>
      {/* Navigation */}
      <header className="border-b border-ivory-border bg-ivory/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-crimson flex items-center justify-center">
              <Feather size={16} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-semibold text-slate-blue text-sm leading-none">
                The Legacy Project Architect
              </span>
              <span className="text-xs text-slate-400 leading-none mt-0.5">Williamsburg Academy</span>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            {stage === "simulate" && (
              <button
                onClick={() => handleReset(0)}
                className="text-xs text-slate-500 hover:text-crimson transition-colors flex items-center gap-1"
              >
                ← New Simulation
              </button>
            )}
            <a
              href="https://williamsburgacademy.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors hidden sm:block"
            >
              Academy
            </a>

            {/* User menu */}
            {user && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-ivory-border bg-ivory hover:border-slate-300 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-crimson flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-slate-600 hidden sm:block">{user.name}</span>
                  <ChevronDown size={12} className="text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 parchment-card rounded-xl shadow-parchment-lg border border-ivory-border overflow-hidden z-20">
                    {/* Profile summary */}
                    <div className="px-4 py-3 border-b border-ivory-border">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-crimson flex items-center justify-center text-white font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-blue">{user.name}</div>
                          <div className="text-xs text-slate-400">{ROLE_LABELS[user.role]}</div>
                        </div>
                      </div>
                    </div>

                    {/* History toggle */}
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-600 hover:bg-ivory-dark transition-colors"
                    >
                      <Clock size={13} className="text-slate-400" />
                      <span>Debate History</span>
                      <span className="ml-auto bg-crimson/10 text-crimson text-xs px-1.5 py-0.5 rounded-full font-semibold">
                        {history.length}
                      </span>
                    </button>

                    {showHistory && history.length > 0 && (
                      <div className="border-t border-ivory-border max-h-48 overflow-y-auto">
                        {history.map((rec) => (
                          <div key={rec.id} className="px-4 py-2 border-b border-ivory-border last:border-0">
                            <div className="flex items-center gap-1.5 text-xs">
                              <span>{rec.figureIcon}</span>
                              <span className="font-medium text-slate-600 truncate">{rec.figureName}</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 truncate">{rec.dilemma}</div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                              <span>{MODE_LABELS[rec.mode]}</span>
                              <span>·</span>
                              <span>{rec.messageCount} msgs</span>
                              <span>·</span>
                              <span>{new Date(rec.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {showHistory && history.length === 0 && (
                      <div className="px-4 py-3 border-t border-ivory-border text-xs text-slate-400 italic">
                        No debates yet — enter the arena to begin.
                      </div>
                    )}

                    {/* Sign out */}
                    <div className="border-t border-ivory-border">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-500 hover:text-crimson hover:bg-crimson/5 transition-colors"
                      >
                        <LogOut size={13} />
                        <span>Sign out & clear profile</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {stage === "configure" && (
          <>
            {/* Hero */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson/10 text-crimson text-xs font-semibold mb-4">
                <BookOpen size={12} /> Historical Simulation Engine
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-blue mb-3 leading-tight">
                Summon the Wisdom<br />
                <span className="text-crimson">of the Ages</span>
              </h1>
              {user && (
                <p className="text-slate-400 text-sm mb-2">
                  Welcome back, <span className="font-semibold text-slate-blue">{user.name}</span>
                  {history.length > 0 && (
                    <> · <span className="text-crimson">{history.length} debate{history.length !== 1 ? "s" : ""} on record</span></>
                  )}
                </p>
              )}
              <p className="text-slate-500 max-w-xl mx-auto text-base leading-relaxed">
                Upload your curriculum, choose a classical figure, and watch Socrates debate
                social media privacy — or let Washington weigh in on political polarization.
              </p>
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[
                { n: 1, label: "Ingest Curriculum", done: !!curriculum },
                { n: 2, label: "Stitch Persona", done: false },
                { n: 3, label: "Enter the Arena", done: false },
              ].map((step, i) => (
                <div key={step.n} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      step.done
                        ? "bg-emerald-500 text-white"
                        : i === 0 || (i === 1 && curriculum)
                        ? "bg-crimson text-white"
                        : "bg-ivory-border text-slate-400"
                    }`}
                  >
                    {step.done ? "✓" : step.n}
                  </div>
                  <span className="text-xs text-slate-500 hidden sm:block">{step.label}</span>
                  {i < 2 && <div className="w-8 h-px bg-ivory-border mx-1" />}
                </div>
              ))}
            </div>

            {/* Config panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CurriculumIngestor value={curriculum} onChange={setCurriculum} />
              <PersonaStitcher
                value={blueprint}
                onChange={handleBlueprintReady}
                disabled={false}
                defaultStudentName={user?.name ?? ""}
              />
            </div>

            {!curriculum && (
              <p className="text-center text-xs text-slate-400 mt-6">
                Curriculum upload is optional — the AI will use its own historical knowledge if none is provided.
              </p>
            )}
          </>
        )}

        {stage === "simulate" && blueprint && (
          <div className="flex flex-col gap-4">
            {/* Breadcrumb context bar */}
            <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 parchment-card text-xs text-slate-500">
              <span className="font-semibold text-slate-blue">{blueprint.figure.icon} {blueprint.figure.name}</span>
              <span className="text-slate-300">·</span>
              <span>on</span>
              <span className="font-medium text-crimson">{blueprint.dilemma.label}</span>
              {curriculum && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-emerald-600">
                    Grounded: {curriculum.kind === "file" ? curriculum.name : "Pasted text"}
                  </span>
                </>
              )}
              {user && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1">
                    <User size={11} /> {user.name}
                  </span>
                </>
              )}
            </div>

            <LegacyArena
              blueprint={blueprint}
              curriculum={curriculum}
              onReset={handleReset}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-ivory-border py-5 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Williamsburg Academy · The Legacy Project Architect</p>
          <p className="flex items-center gap-1">
            Powered by <span className="text-crimson font-medium">Gemini 1.5 Pro</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
