import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export interface QuizQuestion {
  question: string;
  answers: string[];
  correctIndex: number;
}

export async function POST(req: NextRequest) {
  // Récupération de l'IP pour le rate limiting
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const { success, remaining } = rateLimit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Trop de requêtes. Veuillez patienter une minute." },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": remaining.toString() },
      },
    );
  }

  const { topic, mode } = await req.json();
  const isIntrus = mode === "intrus";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Clé API Gemini non configurée dans .env.local" },
      { status: 500 },
    );
  }

  if (!topic || topic.trim() === "") {
    return NextResponse.json(
      { error: "Veuillez indiquer un sujet." },
      { status: 400 },
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = isIntrus
    ? `Tu es un créateur de quiz. Génère exactement 10 énigmes "intrus" sur le sujet suivant : "${topic}".

Réponds UNIQUEMENT avec un tableau JSON valide (sans aucun markdown, sans \`\`\`json, juste le JSON brut).
Chaque élément du tableau doit avoir cette structure exacte :
{
  "question": "Lien thématique commun aux 3 autres mots (ex: Planètes du système solaire)",
  "answers": ["Mot 1", "Mot 2", "Mot 3", "Mot 4"],
  "correctIndex": 0
}

Règles :
- Exactement 10 questions.
- Chaque question a EXACTEMENT 4 réponses.
- 3 réponses partagent un thème commun.
- 1 réponse est l'INTRUS (ne partage pas le thème).
- correctIndex est l'index (0-3) de l'INTRUS dans le tableau answers.
- Le champ "question" doit contenir l'explication du thème commun (sera révélé plus tard).
- Les questions doivent être adaptées au sujet : "${topic}".
- Toutes les questions et réponses doivent être en français`
    : `Tu es un créateur de quiz. Génère exactement 10 questions de quiz sur le sujet suivant : "${topic}".

Réponds UNIQUEMENT avec un tableau JSON valide (sans aucun markdown, sans \`\`\`json, juste le JSON brut).
Chaque élément du tableau doit avoir cette structure exacte :
{
  "question": "La question ici",
  "answers": ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
  "correctIndex": 0
}

Règles :
- Exactement 10 questions
- Entre 2 et 4 réponses par question
- correctIndex est l'index (0-based) de la bonne réponse dans le tableau answers
- Les questions doivent être variées et intéressantes
- Toutes les questions et réponses doivent être en français${
        mode === "speed"
          ? `
- IMPORTANT : mode Rapidité activé. Les questions doivent être SIMPLES et INTUITIVES, de culture générale accessible, pour que les joueurs puissent répondre rapidement sans réfléchir longtemps. Évite les questions techniques, précises ou obscures.`
          : ""
      }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction:
          "Tu es un expert en création de quiz. Tu réponds toujours avec du JSON valide uniquement, sans aucun markdown.",
      },
    });

    const text = (response.text ?? "").trim();

    // Strip potential markdown code fences
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const questions: QuizQuestion[] = JSON.parse(cleaned);

    if (!Array.isArray(questions) || questions.length < 5) {
      return NextResponse.json(
        { error: "La réponse de l'IA n'est pas valide." },
        { status: 500 },
      );
    }

    return NextResponse.json({ questions: questions.slice(0, 10) });
  } catch (err) {
    console.error("Erreur Gemini:", err);
    return NextResponse.json(
      { error: "Erreur lors de la génération des questions." },
      { status: 500 },
    );
  }
}
