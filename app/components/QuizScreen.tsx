"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { QuizQuestion } from "../api/generate-quiz/route";
import { GameMode } from "./SetupScreen";

interface QuizScreenProps {
  questions: QuizQuestion[];
  player1: string;
  player2: string;
  mode: GameMode;
  onComplete: (answers: AnswerRecord[]) => void;
  onQuit: () => void;
}

export interface AnswerRecord {
  question: string;
  correctIndex: number;
  p1Choice: number | null;
  p2Choice: number | null;
  /** In speed mode: who answered correctly first ('p1' | 'p2' | 'none') */
  speedWinner: "p1" | "p2" | "none";
}

const SPEED_TIMER_SECONDS = 15;
const REVEAL_DELAY = 2200;

// AZERTY keyboard bindings
const P1_KEYS = ["a", "z", "e", "r"];
const P2_KEYS = ["u", "i", "o", "p"];
// Key codes for P2 (number row on AZERTY)
const P2_CODES = ["Digit1", "Digit2", "Digit3", "Digit4"];

export default function QuizScreen({
  questions,
  player1,
  player2,
  mode,
  onComplete,
  onQuit,
}: QuizScreenProps) {
  const TIMER_SECONDS =
    mode === "intrus" ? 20 : mode === "speed" ? SPEED_TIMER_SECONDS : 30;
  const [qIndex, setQIndex] = useState(0);
  const [p1Choice, setP1Choice] = useState<number | null>(null);
  const [p2Choice, setP2Choice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [firstAnswered, setFirstAnswered] = useState<"p1" | "p2" | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [animKey, setAnimKey] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const currentQ = questions[qIndex];

  const reveal = useCallback(() => {
    setRevealed(true);
  }, []);

  // Auto-reveal when both players answered
  useEffect(() => {
    if (p1Choice !== null && p2Choice !== null && !revealed) {
      revealRef.current = setTimeout(reveal, 600);
    }
  }, [p1Choice, p2Choice, revealed, reveal]);

  // Timer countdown
  useEffect(() => {
    if (revealed) return;
    if (timeLeft <= 0) {
      reveal();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, revealed, reveal]);

  // Advance to next question after reveal
  useEffect(() => {
    if (!revealed) return;
    // Compute speed winner
    let speedWinner: "p1" | "p2" | "none" = "none";
    if (mode === "speed") {
      const p1ok = p1Choice === currentQ.correctIndex;
      const p2ok = p2Choice === currentQ.correctIndex;
      if (p1ok && p2ok) speedWinner = firstAnswered === "p1" ? "p1" : "p2";
      else if (p1ok) speedWinner = "p1";
      else if (p2ok) speedWinner = "p2";
    }
    const rec: AnswerRecord = {
      question: currentQ.question,
      correctIndex: currentQ.correctIndex,
      p1Choice,
      p2Choice,
      speedWinner,
    };
    const next = [...answersRef.current, rec];

    const currentRevealDelay = mode === "intrus" ? 4000 : REVEAL_DELAY;

    revealRef.current = setTimeout(() => {
      if (qIndex + 1 >= questions.length) {
        onComplete(next);
      } else {
        setAnswers(next);
        setQIndex((i) => i + 1);
        setP1Choice(null);
        setP2Choice(null);
        setRevealed(false);
        setTimeLeft(TIMER_SECONDS);
        setFirstAnswered(null);
        setAnimKey((k) => k + 1);
      }
    }, currentRevealDelay);

    return () => {
      if (revealRef.current) clearTimeout(revealRef.current);
    };
  }, [revealed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard handling
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (revealed) return;
      const key = e.key.toLowerCase();
      const code = e.code;

      // Player 1
      const p1i = P1_KEYS.indexOf(key);
      if (p1i !== -1 && p1i < currentQ.answers.length && p1Choice === null) {
        setP1Choice(p1i);
        if (mode === "speed" && firstAnswered === null) setFirstAnswered("p1");
      }

      // Player 2
      const p2iKey = P2_KEYS.indexOf(e.key);
      const p2iCode = P2_CODES.indexOf(code);
      const p2i = p2iKey !== -1 ? p2iKey : p2iCode;
      if (p2i !== -1 && p2i < currentQ.answers.length && p2Choice === null) {
        setP2Choice(p2i);
        if (mode === "speed" && firstAnswered === null) setFirstAnswered("p2");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [p1Choice, p2Choice, revealed, currentQ.answers.length]);

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor =
    timeLeft > 10
      ? "var(--accent-purple)"
      : timeLeft > 5
        ? "#f59e0b"
        : "#ef4444";

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-primary)",
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: "12px 24px 0",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-color)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
            minHeight: "40px",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={onQuit}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '6px 12px',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              ✕ Quitter
            </button>
            <span
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              QUESTION {qIndex + 1} / {questions.length}
              {mode === "speed" && (
                <span
                  style={{
                    marginLeft: "10px",
                    color: "#f59e0b",
                    fontSize: "0.75rem",
                  }}
                >
                  ⚡ RAPIDITÉ
                </span>
              )}
              {mode === "intrus" && (
                <span
                  style={{
                    marginLeft: "10px",
                    color: "#22c55e",
                    fontSize: "0.75rem",
                  }}
                >
                  🔍 INTRUS
                </span>
              )}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: timerColor,
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "1.4rem",
              fontWeight: 700,
              transition: "color 0.5s",
            }}
          >
            ⏱ {timeLeft}s
          </div>
        </div>
        {/* Progress bar */}
        <div
          style={{
            height: "4px",
            background: "var(--border-color)",
            borderRadius: "2px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(qIndex / questions.length) * 100}%`,
              background:
                "linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))",
              borderRadius: "2px",
              transition: "width 0.4s",
            }}
          />
        </div>
        {/* Timer bar */}
        <div
          style={{
            height: "3px",
            background: "var(--border-color)",
            borderRadius: "2px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${timerPct}%`,
              background: timerColor,
              borderRadius: "2px",
              transition: "width 1s linear, background 0.5s",
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div
        key={`q-${animKey}`}
        style={{
          padding: "20px 40px",
          textAlign: "center",
          animation: "fadeIn 0.4s ease",
          flexShrink: 0,
          background: "rgba(139,92,246,0.04)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.5,
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {mode === "intrus" && !revealed ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "2rem" }}>🔍</span>
              <span
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "#86efac",
                }}
              >
                Trouvez l&apos;intrus !
              </span>
            </div>
          ) : mode === "intrus" && revealed ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Le thème commun était :
              </span>
              <span
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "#22c55e",
                }}
              >
                {currentQ.question}
              </span>
            </div>
          ) : (
            currentQ.question
          )}
        </div>
      </div>

      {/* Split screen */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Player 1 */}
        <PlayerPanel
          key={`p1-${animKey}`}
          playerName={player1}
          playerColor="var(--player1-color)"
          playerLight="var(--player1-light)"
          answers={currentQ.answers}
          correctIndex={currentQ.correctIndex}
          choice={p1Choice}
          revealed={revealed}
          onChoose={setP1Choice}
          keys={P1_KEYS}
          side="left"
          waiting={p1Choice !== null && p2Choice === null && !revealed}
          speedRank={
            mode === "speed" && p1Choice !== null
              ? firstAnswered === "p1"
                ? "1st"
                : p2Choice !== null
                  ? "2nd"
                  : null
              : null
          }
        />

        {/* Divider */}
        <div
          style={{
            width: "2px",
            background:
              "linear-gradient(to bottom, transparent, var(--accent-purple), var(--accent-cyan), transparent)",
            flexShrink: 0,
            opacity: 0.6,
          }}
        />

        {/* Player 2 */}
        <PlayerPanel
          key={`p2-${animKey}`}
          playerName={player2}
          playerColor="var(--player2-color)"
          playerLight="var(--player2-light)"
          answers={currentQ.answers}
          correctIndex={currentQ.correctIndex}
          choice={p2Choice}
          revealed={revealed}
          onChoose={setP2Choice}
          keys={["u", "i", "o", "p"]}
          side="right"
          waiting={p2Choice !== null && p1Choice === null && !revealed}
          speedRank={
            mode === "speed" && p2Choice !== null
              ? firstAnswered === "p2"
                ? "1st"
                : p1Choice !== null
                  ? "2nd"
                  : null
              : null
          }
        />
      </div>
    </div>
  );
}

/* ─── Player Panel ─── */
interface PlayerPanelProps {
  playerName: string;
  playerColor: string;
  playerLight: string;
  answers: string[];
  correctIndex: number;
  choice: number | null;
  revealed: boolean;
  onChoose: (i: number) => void;
  keys: string[];
  side: "left" | "right";
  waiting: boolean;
  speedRank: "1st" | "2nd" | null;
}

function PlayerPanel({
  playerName,
  playerColor,
  playerLight,
  answers,
  correctIndex,
  choice,
  revealed,
  onChoose,
  keys,
  side,
  waiting,
  speedRank,
}: PlayerPanelProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "20px 24px",
        animation:
          side === "left" ? "slideInLeft 0.4s ease" : "slideInRight 0.4s ease",
        background: waiting
          ? `radial-gradient(ellipse at ${side === "left" ? "30%" : "70%"} 50%, rgba(139,92,246,0.07) 0%, transparent 70%)`
          : "transparent",
        transition: "background 0.4s",
      }}
    >
      {/* Player header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
          paddingBottom: "14px",
          borderBottom: `2px solid ${playerColor}33`,
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: `${playerColor}22`,
            border: `2px solid ${playerColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.8rem",
            fontWeight: 700,
            color: playerLight,
            animation: waiting ? "pulse-ring 1.5s ease-out infinite" : "none",
          }}
        >
          {playerName.charAt(0).toUpperCase()}
        </div>
        <span style={{ fontWeight: 700, color: playerLight, fontSize: "1rem" }}>
          {playerName}
        </span>
        {waiting && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: "0.8rem",
              color: playerColor,
              fontStyle: "italic",
            }}
          >
            En attente…
          </span>
        )}
        {speedRank === "1st" && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#f59e0b",
              background: "rgba(245,158,11,0.15)",
              border: "1px solid #f59e0b55",
              borderRadius: "6px",
              padding: "2px 8px",
              letterSpacing: "0.02em",
            }}
          >
            ⚡ 1er !
          </span>
        )}
        {speedRank === "2nd" && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              padding: "2px 8px",
            }}
          >
            2e
          </span>
        )}
        {choice !== null && !revealed && !waiting && speedRank === null && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: "0.8rem",
              color: "#22c55e",
              fontWeight: 600,
            }}
          >
            ✓ Répondu
          </span>
        )}
      </div>

      {/* Answer buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          flex: 1,
          justifyContent: "center",
        }}
      >
        {answers.map((ans, i) => {
          const isChosen = choice === i;
          const isCorrect = i === correctIndex;
          // Before reveal: all buttons look identical regardless of choice
          // After reveal: show correct/wrong colors
          let bg = "var(--bg-card)";
          let border = `1.5px solid ${playerColor}33`;
          let textColor = "var(--text-primary)";
          let icon = "";

          if (revealed) {
            if (isCorrect) {
              bg = "rgba(34,197,94,0.15)";
              border = "1.5px solid #22c55e";
              textColor = "#86efac";
              icon = " ✓";
            } else if (isChosen && !isCorrect) {
              bg = "rgba(239,68,68,0.12)";
              border = "1.5px solid #ef4444";
              textColor = "#fca5a5";
              icon = " ✗";
            } else {
              textColor = "var(--text-secondary)";
            }
          } else if (choice !== null) {
            // Voted but not revealed: dim all buttons equally, no highlight
            textColor = "var(--text-secondary)";
          }

          const locked = choice !== null || revealed;

          return (
            <button
              key={i}
              onClick={() => !locked && onChoose(i)}
              disabled={locked}
              style={{
                width: "100%",
                padding: "14px 16px",
                background: bg,
                border,
                borderRadius: "12px",
                color: textColor,
                fontSize: "clamp(0.8rem, 1.5vw, 0.95rem)",
                fontWeight: revealed && (isChosen || isCorrect) ? 700 : 500,
                textAlign: "left",
                cursor: locked ? "default" : "pointer",
                transition: "all 0.25s",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transform: "scale(1)",
                opacity: choice !== null && !revealed ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!locked)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    `${playerColor}15`;
              }}
              onMouseLeave={(e) => {
                if (!locked && !isChosen)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--bg-card)";
              }}
            >
              <span
                style={{
                  minWidth: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  background:
                    revealed && isCorrect
                      ? "#22c55e"
                      : revealed && isChosen
                        ? playerColor
                        : "rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color:
                    revealed && (isChosen || isCorrect)
                      ? "white"
                      : "var(--text-secondary)",
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
              >
                {keys[i]?.toUpperCase() ?? String.fromCharCode(65 + i)}
              </span>
              <span style={{ flex: 1 }}>
                {ans}
                {icon}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
