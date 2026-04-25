"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Loader2,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Scroll,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import type { PersonaBlueprint } from "./PersonaStitcher";
import type { CurriculumSource } from "./CurriculumIngestor";

export interface Message {
  id: string;
  role: "user" | "legacy" | "legacy-b" | "system";
  speakerLabel: string;
  content: string;
  timestamp: Date;
}

interface Props {
  blueprint: PersonaBlueprint;
  curriculum: CurriculumSource;
  onReset: (messageCount: number) => void;
}

export default function LegacyArena({ blueprint, curriculum, onReset }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages]);

  const speak = useCallback((text: string) => {
    if (!speechEnabled || !("speechSynthesis" in window)) return;
    const utt = new SpeechSynthesisUtterance(text.slice(0, 300));
    utt.rate = 0.9;
    utt.pitch = 0.85;
    window.speechSynthesis.speak(utt);
  }, [speechEnabled]);

  const sendToAPI = useCallback(
    async (userMessage: string | null, history: Message[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blueprint,
            curriculumText: curriculum?.text ?? "",
            messages: history.filter((m) => m.role !== "system"),
            userMessage,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? `API error ${res.status}`);
        }

        const data: { reply: string; speakerLabel: string; secondReply?: string; secondLabel?: string } =
          await res.json();

        const newMessages: Message[] = [];

        if (userMessage) {
          newMessages.push({
            id: crypto.randomUUID(),
            role: "user",
            speakerLabel: blueprint.mode === "debate" ? blueprint.studentName : "You",
            content: userMessage,
            timestamp: new Date(),
          });
        }

        newMessages.push({
          id: crypto.randomUUID(),
          role: "legacy",
          speakerLabel: data.speakerLabel,
          content: data.reply,
          timestamp: new Date(),
        });

        if (data.secondReply && data.secondLabel) {
          newMessages.push({
            id: crypto.randomUUID(),
            role: "legacy-b",
            speakerLabel: data.secondLabel,
            content: data.secondReply,
            timestamp: new Date(),
          });
        }

        setMessages((prev) => [...prev, ...newMessages]);
        speak(data.reply);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [blueprint, curriculum, speak]
  );

  // Opening statement on mount
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    const openingMsg: Message = {
      id: crypto.randomUUID(),
      role: "system",
      speakerLabel: "System",
      content: `The arena is open. ${blueprint.figure.name} stands ready to address the question of ${blueprint.dilemma.label}.`,
      timestamp: new Date(),
    };
    setMessages([openingMsg]);
    sendToAPI(null, []);
  }, [blueprint, sendToAPI, initialized]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    sendToAPI(text, messages);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExport = () => {
    const content = messages
      .filter((m) => m.role !== "system")
      .map((m) => `[${m.speakerLabel}]\n${m.content}`)
      .join("\n\n---\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `legacy-simulation-${blueprint.figure.id}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const legacyFigureLabel = blueprint.figure.name;

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      {/* Arena header */}
      <div className="parchment-card rounded-b-none border-b-0 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-crimson/10 flex items-center justify-center">
            <Scroll size={16} className="text-crimson" />
          </div>
          <div>
            <h2 className="font-serif text-base font-semibold text-slate-blue">
              {blueprint.figure.icon} {legacyFigureLabel}
              {blueprint.mode === "dual" && " vs. Contemporary Voice"}
            </h2>
            <p className="text-xs text-slate-400">
              {blueprint.dilemma.label} · {
                blueprint.mode === "solo" ? "Sage Speaks" :
                blueprint.mode === "debate" ? `Debating ${blueprint.studentName}` :
                "Dual-Persona"
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            title={speechEnabled ? "Disable voice" : "Enable voice"}
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className="btn-outline px-2.5 py-2"
          >
            {speechEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <button onClick={handleExport} title="Export transcript" className="btn-outline px-2.5 py-2">
            <Download size={14} />
          </button>
          <button onClick={() => onReset(messages.filter(m => m.role !== "system").length)} title="New simulation" className="btn-outline px-2.5 py-2 flex items-center gap-1 text-xs">
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto parchment-card rounded-none border-t-0 border-b-0 px-5 py-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} figureName={legacyFigureLabel} />
        ))}

        {loading && (
          <div className="flex items-center gap-3 py-2">
            <div className="w-7 h-7 rounded-full bg-parchment flex items-center justify-center text-sm">
              {blueprint.figure.icon}
            </div>
            <div className="flex gap-1 items-center">
              <Loader2 size={14} className="animate-spin text-crimson" />
              <span className="text-xs text-slate-400 italic font-serif">
                {legacyFigureLabel} is composing a response…
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-md">
            <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
            <button
              onClick={() => sendToAPI(null, messages)}
              className="ml-auto text-xs text-red-600 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {blueprint.mode !== "solo" && (
        <div className="parchment-card rounded-t-none border-t px-4 py-3 flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={2}
              placeholder={
                blueprint.mode === "debate"
                  ? `${blueprint.studentName}: Challenge ${blueprint.figure.name}'s position…`
                  : "Prompt a new exchange between the two figures…"
              }
              className="legacy-input resize-none pr-2 leading-relaxed text-sm"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn-crimson px-3 py-2.5 flex items-center gap-2 flex-shrink-0"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            <span className="text-sm">Send</span>
          </button>
        </div>
      )}

      {blueprint.mode === "solo" && !loading && messages.filter((m) => m.role !== "system").length > 0 && (
        <div className="parchment-card rounded-t-none border-t px-4 py-3 flex justify-center">
          <button
            onClick={() => sendToAPI("Continue your discourse.", messages)}
            disabled={loading}
            className="btn-outline flex items-center gap-2 text-sm"
          >
            <MessageSquare size={14} /> Prompt Next Discourse
          </button>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message, figureName }: { message: Message; figureName: string }) {
  const isLegacy = message.role === "legacy" || message.role === "legacy-b";
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="text-center">
        <span className="text-xs text-parchment-text/60 italic font-serif">{message.content}</span>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1 ${
          isUser
            ? "bg-slate-blue text-white"
            : message.role === "legacy-b"
            ? "bg-amber-100 border border-amber-300"
            : "bg-parchment border border-parchment-dark"
        }`}
      >
        {isUser ? message.speakerLabel.charAt(0).toUpperCase() : "📜"}
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <span className="text-xs font-semibold text-slate-400 px-1">{message.speakerLabel}</span>

        <div
          className={`rounded-lg px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-slate-blue text-white rounded-tr-none"
              : message.role === "legacy-b"
              ? "bg-amber-50 border border-amber-200 text-parchment-text rounded-tl-none font-serif"
              : "bg-parchment border border-parchment-dark text-parchment-text rounded-tl-none font-serif"
          }`}
        >
          {message.content.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split("\n").length - 1 && <br />}
            </span>
          ))}
        </div>

        <span className="text-xs text-slate-300 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
