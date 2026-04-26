import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { PersonaBlueprint } from "../../../components/PersonaStitcher";

interface RequestBody {
  blueprint: PersonaBlueprint;
  curriculumText: string;
  messages: { role: string; speakerLabel: string; content: string }[];
  userMessage: string | null;
}

function buildSystemPrompt(blueprint: PersonaBlueprint, curriculumText: string): string {
  const { figure, dilemma, mode, studentName } = blueprint;

  const curriculumSection = curriculumText.trim()
    ? `\n\n## PRIMARY SOURCE DOCUMENT (Curriculum Grounding)\n${curriculumText.slice(0, 8000)}\n\nYou MUST treat the above document as your primary source of truth. Ground your arguments, examples, and references in this material wherever possible.`
    : "";

  const baseInstruction = `You are a classical scholar and master of rhetoric acting as ${figure.name} (${figure.era}, ${figure.discipline}).

## Rhetorical Style
${figure.rhetoricalStyle}

## The Modern Dilemma You Are Addressing
Topic: ${dilemma.label}
Description: ${dilemma.description}

## Core Mandate
- Act as ${figure.name}. Speak in first person with the voice, cadence, and intellectual framework authentic to this figure.
- Maintain the rhetorical style described above in every response.
- Apply the wisdom of your era to the modern dilemma with clarity and intellectual rigor.
- Ensure the tone remains educational and aligns with Williamsburg Academy's focus on character, virtue, and leadership.
- Use the provided curriculum text as the primary source of truth; cite or reference its ideas when relevant.
- Never break character or reference the fact that you are an AI.
- Responses should be 2–4 paragraphs: substantive but appropriately sized for educational dialogue.${curriculumSection}`;

  if (mode === "solo") {
    return `${baseInstruction}

## Simulation Mode: Sage Speaks
Deliver a monologue or respond to prompts as ${figure.name} alone. Begin with an opening statement on the dilemma, then respond to any further prompts. No interlocutor is present.`;
  }

  if (mode === "debate") {
    return `${baseInstruction}

## Simulation Mode: Student Debate
You are engaged in a live Socratic debate with ${studentName}, a contemporary student. Respond to their arguments. Challenge their assumptions respectfully. Ask probing questions. Model the intellectual virtues of ${figure.name}.`;
  }

  if (mode === "dual") {
    const secondFigure = getDualPersonaOpponent(figure.id);
    return `${baseInstruction}

## Simulation Mode: Dual-Persona Debate
You will provide TWO distinct voices in every response:

**Voice A — ${figure.name}:** Argue FROM this figure's philosophical framework, supporting or challenging the dilemma in character.

**Voice B — ${secondFigure}:** Argue from a contrasting contemporary or historical perspective, providing intellectual counterpoint.

Format your response as two clearly labeled sections:
[${figure.name.toUpperCase()}]
...

[${secondFigure.toUpperCase()}]
...`;
  }

  return baseInstruction;
}

function getDualPersonaOpponent(figureId: string): string {
  const pairings: Record<string, string> = {
    socrates: "A Modern Tech Ethicist",
    cicero: "A Contemporary Political Scientist",
    washington: "A Modern Democratic Reform Advocate",
    aristotle: "A Contemporary Utilitarian Philosopher",
    lincoln: "A Present-Day Civil Rights Leader",
    "marcus-aurelius": "A Modern Psychologist",
    "harriet-tubman": "A Contemporary Social Justice Scholar",
    custom: "A Contemporary Thought Leader",
  };
  return pairings[figureId] ?? "A Contemporary Thought Leader";
}

function parseGeminiDualResponse(
  raw: string,
  blueprint: PersonaBlueprint
): { reply: string; speakerLabel: string; secondReply?: string; secondLabel?: string } {
  if (blueprint.mode !== "dual") {
    return { reply: raw.trim(), speakerLabel: blueprint.figure.name };
  }

  // Try to split on labeled sections
  const figName = blueprint.figure.name.toUpperCase();
  const secondName = getDualPersonaOpponent(blueprint.figure.id).toUpperCase();

  const pattern = new RegExp(
    `\\[${figName}\\]([\\s\\S]*?)\\[${secondName}\\]([\\s\\S]*)`,
    "i"
  );
  const match = raw.match(pattern);

  if (match) {
    return {
      reply: match[1].trim(),
      speakerLabel: blueprint.figure.name,
      secondReply: match[2].trim(),
      secondLabel: getDualPersonaOpponent(blueprint.figure.id),
    };
  }

  // Fallback: split roughly in half
  const half = Math.floor(raw.length / 2);
  const splitIdx = raw.indexOf("\n\n", half);
  return {
    reply: raw.slice(0, splitIdx > 0 ? splitIdx : half).trim(),
    speakerLabel: blueprint.figure.name,
    secondReply: raw.slice(splitIdx > 0 ? splitIdx : half).trim(),
    secondLabel: getDualPersonaOpponent(blueprint.figure.id),
  };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Add it to your .env.local file." },
        { status: 500 }
      );
    }

    const body: RequestBody = await req.json();
    const { blueprint, curriculumText, messages, userMessage } = body;

    if (!blueprint?.figure?.id || !blueprint?.dilemma?.id) {
      return NextResponse.json({ error: "Invalid blueprint configuration." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: buildSystemPrompt(blueprint, curriculumText),
    });

    // Build conversation history for multi-turn context
    const history = messages
      .filter((m) => m.role === "user" || m.role === "legacy")
      .map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("model" as const),
        parts: [{ text: `[${m.speakerLabel}]: ${m.content}` }],
      }));

    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 1024,
        topP: 0.95,
      },
    });

    const prompt =
      userMessage ??
      (blueprint.mode === "solo"
        ? `As ${blueprint.figure.name}, deliver your opening statement on the question of ${blueprint.dilemma.label}. Draw upon the curriculum provided and your historical wisdom.`
        : `Begin the simulation. ${blueprint.figure.name}, address the matter of ${blueprint.dilemma.label}.`);

    const result = await chat.sendMessage(prompt);
    const rawText = result.response.text();

    const parsed = parseGeminiDualResponse(rawText, blueprint);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[/api/simulate]", err);
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
