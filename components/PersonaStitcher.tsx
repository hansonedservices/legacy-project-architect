"use client";

import { useState } from "react";
import { Scroll, Zap, ChevronDown, Users, Swords } from "lucide-react";

export interface PersonaBlueprint {
  figure: ClassicalFigure;
  dilemma: ModernDilemma;
  mode: SimulationMode;
  studentName: string;
}

export type SimulationMode = "solo" | "dual" | "debate";

export interface ClassicalFigure {
  id: string;
  name: string;
  era: string;
  discipline: string;
  rhetoricalStyle: string;
  icon: string;
}

export interface ModernDilemma {
  id: string;
  label: string;
  description: string;
}

const CLASSICAL_FIGURES: ClassicalFigure[] = [
  {
    id: "socrates",
    name: "Socrates",
    era: "470–399 BC",
    discipline: "Philosophy",
    rhetoricalStyle: "Socratic method — probing questions, elenchus, intellectual humility",
    icon: "⚗️",
  },
  {
    id: "cicero",
    name: "Marcus Tullius Cicero",
    era: "106–43 BC",
    discipline: "Rhetoric & Statesmanship",
    rhetoricalStyle: "Eloquent oratory, moral duty (officium), republican virtue",
    icon: "🏛️",
  },
  {
    id: "washington",
    name: "George Washington",
    era: "1732–1799",
    discipline: "Leadership & Character",
    rhetoricalStyle: "Measured restraint, civic duty, Rules of Civility",
    icon: "🦅",
  },
  {
    id: "aristotle",
    name: "Aristotle",
    era: "384–322 BC",
    discipline: "Logic & Ethics",
    rhetoricalStyle: "Systematic reasoning, eudaimonia, the golden mean",
    icon: "📐",
  },
  {
    id: "lincoln",
    name: "Abraham Lincoln",
    era: "1809–1865",
    discipline: "Statecraft & Rhetoric",
    rhetoricalStyle: "Plain-spoken moral clarity, biblical cadence, firm resolve",
    icon: "⚖️",
  },
  {
    id: "marcus-aurelius",
    name: "Marcus Aurelius",
    era: "121–180 AD",
    discipline: "Stoic Philosophy",
    rhetoricalStyle: "Stoic introspection, meditative prose, the examined life",
    icon: "🌿",
  },
  {
    id: "harriet-tubman",
    name: "Harriet Tubman",
    era: "1822–1913",
    discipline: "Moral Courage",
    rhetoricalStyle: "Resolute faith, pragmatic heroism, liberation ethics",
    icon: "⭐",
  },
  {
    id: "custom",
    name: "Custom Figure",
    era: "Any era",
    discipline: "Educator-defined",
    rhetoricalStyle: "Describe below",
    icon: "✍️",
  },
];

const MODERN_DILEMMAS: ModernDilemma[] = [
  { id: "social-media-privacy", label: "Social Media & Privacy", description: "Should individuals sacrifice privacy for social connection and convenience?" },
  { id: "ai-ethics", label: "Artificial Intelligence & Ethics", description: "How should society govern AI that can reason, create, and deceive?" },
  { id: "political-polarization", label: "Political Polarization", description: "How do citizens maintain civic virtue when discourse collapses into tribalism?" },
  { id: "climate-leadership", label: "Climate & Intergenerational Duty", description: "What moral obligations do present leaders owe to future generations?" },
  { id: "cancel-culture", label: "Cancel Culture & Redemption", description: "Can a just society punish speech without silencing the pursuit of truth?" },
  { id: "economic-inequality", label: "Economic Inequality", description: "Is extreme wealth compatible with a virtuous republic?" },
  { id: "misinformation", label: "Misinformation & Truth", description: "Who bears responsibility for the spread of falsehoods in a free society?" },
  { id: "custom-dilemma", label: "Custom Dilemma", description: "Define your own contemporary challenge." },
];

const MODE_OPTIONS: { id: SimulationMode; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: "solo",
    label: "Sage Speaks",
    description: "The historical figure delivers a monologue or responds to your questions alone.",
    icon: <Scroll size={16} />,
  },
  {
    id: "debate",
    label: "Student Debates",
    description: "You take on a role and debate the historical figure directly.",
    icon: <Swords size={16} />,
  },
  {
    id: "dual",
    label: "Dual-Persona",
    description: "Two historical figures argue opposing sides of the modern dilemma.",
    icon: <Users size={16} />,
  },
];

interface Props {
  value: PersonaBlueprint | null;
  onChange: (blueprint: PersonaBlueprint) => void;
  disabled?: boolean;
  defaultStudentName?: string;
}

export default function PersonaStitcher({ value, onChange, disabled, defaultStudentName = "" }: Props) {
  const [figure, setFigure] = useState<ClassicalFigure>(value?.figure ?? CLASSICAL_FIGURES[0]);
  const [dilemma, setDilemma] = useState<ModernDilemma>(value?.dilemma ?? MODERN_DILEMMAS[0]);
  const [mode, setMode] = useState<SimulationMode>(value?.mode ?? "debate");
  const [studentName, setStudentName] = useState(value?.studentName ?? defaultStudentName);
  const [customFigure, setCustomFigure] = useState("");
  const [customDilemma, setCustomDilemma] = useState("");
  const [figureOpen, setFigureOpen] = useState(false);
  const [dilemmaOpen, setDilemmaOpen] = useState(false);

  const activeFigure = figure.id === "custom" && customFigure
    ? { ...figure, name: customFigure, rhetoricalStyle: customFigure }
    : figure;

  const activeDilemma = dilemma.id === "custom-dilemma" && customDilemma
    ? { ...dilemma, label: customDilemma, description: customDilemma }
    : dilemma;

  const isReady =
    figure.id !== "custom" || customFigure.trim().length > 0
      ? dilemma.id !== "custom-dilemma" || customDilemma.trim().length > 0
      : false;

  const handleLaunch = () => {
    if (!isReady) return;
    onChange({
      figure: activeFigure,
      dilemma: activeDilemma,
      mode,
      studentName: studentName.trim() || "Student",
    });
  };

  return (
    <section className="parchment-card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-full bg-crimson/10 flex items-center justify-center">
          <Zap size={18} className="text-crimson" />
        </div>
        <div>
          <h2 className="font-serif text-lg font-semibold text-slate-blue">Persona Stitcher</h2>
          <p className="text-xs text-slate-500">Configure the simulation's historical and modern axes</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Classical Figure selector */}
        <div>
          <label className="legacy-label mb-2 block">Classical Figure</label>
          <div className="relative">
            <button
              type="button"
              disabled={disabled}
              onClick={() => { setFigureOpen(!figureOpen); setDilemmaOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-ivory-border rounded-md bg-white hover:bg-ivory-dark transition-colors text-sm text-slate-blue disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <span>{figure.icon}</span>
                <span className="font-medium">{figure.name}</span>
                <span className="text-slate-400 text-xs">{figure.era}</span>
              </span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${figureOpen ? "rotate-180" : ""}`} />
            </button>

            {figureOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-ivory-border rounded-md shadow-parchment-lg max-h-64 overflow-y-auto">
                {CLASSICAL_FIGURES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => { setFigure(f); setFigureOpen(false); }}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 hover:bg-ivory-dark text-left transition-colors ${f.id === figure.id ? "bg-crimson/5" : ""}`}
                  >
                    <span className="text-lg mt-0.5">{f.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-blue">{f.name}</p>
                      <p className="text-xs text-slate-400">{f.discipline} · {f.era}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {figure.id === "custom" && (
            <input
              className="legacy-input mt-2"
              placeholder="e.g. Confucius, Cleopatra, Frederick Douglass…"
              value={customFigure}
              onChange={(e) => setCustomFigure(e.target.value)}
              disabled={disabled}
            />
          )}

          {figure.id !== "custom" && (
            <p className="mt-1.5 text-xs text-slate-400 italic">{figure.rhetoricalStyle}</p>
          )}
        </div>

        {/* Modern Dilemma selector */}
        <div>
          <label className="legacy-label mb-2 block">Modern Dilemma</label>
          <div className="relative">
            <button
              type="button"
              disabled={disabled}
              onClick={() => { setDilemmaOpen(!dilemmaOpen); setFigureOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-ivory-border rounded-md bg-white hover:bg-ivory-dark transition-colors text-sm text-slate-blue disabled:opacity-50"
            >
              <span className="font-medium">{dilemma.label}</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${dilemmaOpen ? "rotate-180" : ""}`} />
            </button>

            {dilemmaOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-ivory-border rounded-md shadow-parchment-lg max-h-64 overflow-y-auto">
                {MODERN_DILEMMAS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => { setDilemma(d); setDilemmaOpen(false); }}
                    className={`w-full flex flex-col gap-0.5 px-3 py-2.5 hover:bg-ivory-dark text-left transition-colors ${d.id === dilemma.id ? "bg-crimson/5" : ""}`}
                  >
                    <p className="text-sm font-medium text-slate-blue">{d.label}</p>
                    <p className="text-xs text-slate-400">{d.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {dilemma.id === "custom-dilemma" && (
            <input
              className="legacy-input mt-2"
              placeholder="Describe the modern dilemma…"
              value={customDilemma}
              onChange={(e) => setCustomDilemma(e.target.value)}
              disabled={disabled}
            />
          )}

          {dilemma.id !== "custom-dilemma" && (
            <p className="mt-1.5 text-xs text-slate-400">{dilemma.description}</p>
          )}
        </div>

        {/* Simulation Mode */}
        <div>
          <label className="legacy-label mb-2 block">Simulation Mode</label>
          <div className="grid grid-cols-3 gap-2">
            {MODE_OPTIONS.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={disabled}
                onClick={() => setMode(m.id)}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-md border text-center text-xs transition-all ${
                  mode === m.id
                    ? "border-crimson bg-crimson/5 text-crimson font-semibold"
                    : "border-ivory-border text-slate-500 hover:border-parchment-dark hover:bg-ivory-dark"
                }`}
              >
                <span className={mode === m.id ? "text-crimson" : "text-slate-400"}>{m.icon}</span>
                <span className="font-semibold leading-tight">{m.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            {MODE_OPTIONS.find((m) => m.id === mode)?.description}
          </p>
        </div>

        {/* Student name (for debate mode) */}
        {mode === "debate" && (
          <div>
            <label className="legacy-label mb-2 block">Your Name / Role</label>
            <input
              className="legacy-input"
              placeholder="e.g. Alexis, a modern senator…"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              disabled={disabled}
            />
          </div>
        )}

        {/* Launch */}
        <button
          type="button"
          onClick={handleLaunch}
          disabled={disabled || !isReady}
          className="btn-crimson w-full flex items-center justify-center gap-2 text-sm mt-1"
        >
          <Zap size={15} />
          Stitch Persona &amp; Enter the Arena
        </button>
      </div>
    </section>
  );
}
