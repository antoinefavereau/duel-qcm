"use client";

import { useState } from "react";
import SetupScreen from "./components/SetupScreen";
import QuizScreen, { AnswerRecord } from "./components/QuizScreen";
import ResultsScreen from "./components/ResultsScreen";
import { QuizQuestion } from "./api/generate-quiz/route";
import { loadScores, saveScores, GameMode } from "./components/SetupScreen";

type Phase = "setup" | "quiz" | "results";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [player1, setPlayer1] = useState("Joueur 1");
  const [player2, setPlayer2] = useState("Joueur 2");
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [mode, setMode] = useState<GameMode>("normal");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (
    topic: string,
    p1: string,
    p2: string,
    gameMode: GameMode,
  ) => {
    setIsLoading(true);
    setError(null);
    setPlayer1(p1);
    setPlayer2(p2);
    setMode(gameMode);

    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, mode: gameMode }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Erreur inconnue");
        setIsLoading(false);
        return;
      }

      setQuestions(data.questions);
      setIsLoading(false);
      setPhase("quiz");
    } catch {
      setError("Impossible de joindre l'API. Vérifiez votre connexion.");
      setIsLoading(false);
    }
  };

  const handleComplete = (finalAnswers: AnswerRecord[]) => {
    setAnswers(finalAnswers);

    // Compute result and update cumulative scores
    const p1Score = finalAnswers.filter(
      (a) => a.p1Choice === a.correctIndex,
    ).length;
    const p2Score = finalAnswers.filter(
      (a) => a.p2Choice === a.correctIndex,
    ).length;
    const prev = loadScores();
    saveScores({
      p1Wins: (prev?.p1Wins ?? 0) + (p1Score > p2Score ? 1 : 0),
      p2Wins: (prev?.p2Wins ?? 0) + (p2Score > p1Score ? 1 : 0),
      ties: (prev?.ties ?? 0) + (p1Score === p2Score ? 1 : 0),
      p1Name: player1,
      p2Name: player2,
    });

    setPhase("results");
  };

  const handleReplay = () => {
    setQuestions([]);
    setAnswers([]);
    setError(null);
    setPhase("setup");
  };

  if (phase === "quiz") {
    return (
      <QuizScreen
        questions={questions}
        player1={player1}
        player2={player2}
        mode={mode}
        onComplete={handleComplete}
        onQuit={handleReplay}
      />
    );
  }

  if (phase === "results") {
    return (
      <ResultsScreen
        player1={player1}
        player2={player2}
        answers={answers}
        mode={mode}
        onReplay={handleReplay}
      />
    );
  }

  return (
    <SetupScreen onStart={handleStart} isLoading={isLoading} error={error} />
  );
}
