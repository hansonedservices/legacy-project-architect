"use client";

import { useState, useRef, useCallback } from "react";
import { UploadCloud, FileText, ClipboardPaste, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export type CurriculumSource =
  | { kind: "file"; name: string; text: string }
  | { kind: "paste"; text: string }
  | null;

interface Props {
  value: CurriculumSource;
  onChange: (source: CurriculumSource) => void;
}

type Tab = "upload" | "paste";

export default function CurriculumIngestor({ value, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [dragging, setDragging] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.type.startsWith("text/") && file.type !== "application/pdf") {
        setError("Please upload a .txt, .md, or .pdf text file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File must be under 5 MB.");
        return;
      }
      setLoading(true);
      try {
        const text = await readFileAsText(file);
        onChange({ kind: "file", name: file.name, text });
      } catch {
        setError("Could not read file. For PDFs, paste the extracted text instead.");
      } finally {
        setLoading(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handlePasteSubmit = () => {
    if (!pasteText.trim()) {
      setError("Please enter some curriculum text.");
      return;
    }
    setError(null);
    onChange({ kind: "paste", text: pasteText.trim() });
  };

  const clearSource = () => {
    onChange(null);
    setPasteText("");
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <section className="parchment-card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-full bg-crimson/10 flex items-center justify-center">
          <FileText className="w-4.5 h-4.5 text-crimson" size={18} />
        </div>
        <div>
          <h2 className="font-serif text-lg font-semibold text-slate-blue">Curriculum Ingestor</h2>
          <p className="text-xs text-slate-500">Grounding layer — the source of historical truth</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-ivory-dark rounded-md p-1">
        {(["upload", "paste"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-white shadow-sm text-slate-blue"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "upload" ? <UploadCloud size={14} /> : <ClipboardPaste size={14} />}
            {tab === "upload" ? "Upload File" : "Paste Text"}
          </button>
        ))}
      </div>

      {/* Active source badge */}
      {value && (
        <div className="flex items-center justify-between mb-4 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">
              {value.kind === "file" ? value.name : "Pasted transcript"}
            </span>
            <span className="text-xs text-emerald-600">
              ({(value.text.length / 1000).toFixed(1)}k chars)
            </span>
          </div>
          <button onClick={clearSource} className="text-emerald-600 hover:text-red-500 transition-colors">
            <XCircle size={15} />
          </button>
        </div>
      )}

      {/* Upload panel */}
      {activeTab === "upload" && !value && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
            dragging
              ? "border-crimson bg-crimson/5"
              : "border-ivory-border hover:border-parchment-dark hover:bg-ivory-dark/50"
          }`}
        >
          {loading ? (
            <Loader2 className="animate-spin text-crimson" size={32} />
          ) : (
            <UploadCloud size={32} className={dragging ? "text-crimson" : "text-slate-400"} />
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">
              {loading ? "Reading file…" : "Drop a file or click to browse"}
            </p>
            <p className="text-xs text-slate-400 mt-1">TXT, MD — up to 5 MB</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Paste panel */}
      {activeTab === "paste" && !value && (
        <div className="space-y-3">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste a lecture transcript, chapter excerpt, primary source document, or any curriculum text here…"
            className="legacy-input min-h-[160px] resize-y font-sans text-sm leading-relaxed"
          />
          <button
            onClick={handlePasteSubmit}
            disabled={!pasteText.trim()}
            className="btn-crimson w-full flex items-center justify-center gap-2"
          >
            <ClipboardPaste size={14} />
            Ingest Curriculum Text
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-red-600">
          <XCircle size={13} /> {error}
        </p>
      )}

      {/* Hint */}
      {!value && (
        <p className="mt-4 text-xs text-slate-400 text-center">
          The AI will treat this document as its primary source of truth during the simulation.
        </p>
      )}
    </section>
  );
}
