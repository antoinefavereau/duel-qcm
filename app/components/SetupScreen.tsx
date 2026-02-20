"use client";

import { useEffect, useState } from "react";

export interface CumulativeScores {
  p1Wins: number;
  p2Wins: number;
  ties: number;
  p1Name: string;
  p2Name: string;
}

const STORAGE_KEY = "duelQcm_scores";
const P1_NAME_KEY = "duelQcm_p1Name";
const P2_NAME_KEY = "duelQcm_p2Name";
const MODE_KEY = "duelQcm_mode";

export function loadScores(): CumulativeScores | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveScores(scores: CumulativeScores) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {
    /* noop */
  }
}

interface SetupScreenProps {
  onStart: (
    topic: string,
    player1: string,
    player2: string,
    mode: GameMode,
  ) => void;
  isLoading: boolean;
  error: string | null;
}

export type GameMode = "normal" | "speed" | "intrus";

export default function SetupScreen({
  onStart,
  isLoading,
  error,
}: SetupScreenProps) {
  const [topic, setTopic] = useState("");
  const [player1, setPlayer1] = useState("Joueur 1");
  const [player2, setPlayer2] = useState("Joueur 2");
  const [mode, setMode] = useState<GameMode>("normal");
  const [cumulative, setCumulative] = useState<CumulativeScores | null>(null);

  useEffect(() => {
    const p1 = localStorage.getItem(P1_NAME_KEY);
    const p2 = localStorage.getItem(P2_NAME_KEY);
    const savedMode = localStorage.getItem(MODE_KEY) as GameMode | null;
    if (p1) setPlayer1(p1);
    if (p2) setPlayer2(p2);
    if (savedMode) setMode(savedMode);
    setCumulative(loadScores());
  }, []);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p1 = player1.trim() || "Joueur 1";
    const p2 = player2.trim() || "Joueur 2";
    const finalTopic = topic.trim() || "Culture Générale";
    localStorage.setItem(P1_NAME_KEY, p1);
    localStorage.setItem(P2_NAME_KEY, p2);
    localStorage.setItem(MODE_KEY, mode);
    onStart(finalTopic, p1, p2, mode);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 60%), var(--bg-primary)",
        animation: "fadeIn 0.6s ease",
      }}
    >
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h1
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 900,
            background:
              "linear-gradient(135deg, var(--accent-purple-light), var(--accent-cyan))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "12px",
            animation: "glow 3s ease-in-out infinite",
          }}
        >
          Duel QCM
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
          Le quiz à deux joueurs propulsé par l&apos;IA
        </p>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "20px",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Mode selector */}
        <div>
          <label
            style={{
              display: "block",
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Mode de jeu
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
            }}
          >
            {[
              ["normal", "🎮", "Normal", "Un point par bonne réponse"],
              [
                "speed",
                "⚡",
                "Rapidité",
                "Le premier correct gagne le point !",
              ],
              ["intrus", "🔍", "Intrus", "Trouvez l'intrus parmi les 4 !"],
            ].map(([m, icon, label, desc]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m as GameMode)}
                style={{
                  padding: "12px 14px",
                  background:
                    mode === m
                      ? m === "speed"
                        ? "rgba(245,158,11,0.15)"
                        : m === "intrus"
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(139,92,246,0.15)"
                      : "var(--bg-secondary)",
                  border: `2px solid ${
                    mode === m
                      ? m === "speed"
                        ? "#f59e0b"
                        : m === "intrus"
                          ? "#22c55e"
                          : "var(--accent-purple)"
                      : "var(--border-color)"
                  }`,
                  borderRadius: "10px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: "1.1rem", marginBottom: "4px" }}>
                  {icon}{" "}
                  <span
                    style={{
                      fontWeight: 700,
                      color:
                        mode === m
                          ? m === "speed"
                            ? "#fbbf24"
                            : m === "intrus"
                              ? "#86efac"
                              : "var(--accent-purple-light)"
                          : "var(--text-primary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {label}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Topic */}
        <div>
          <label
            style={{
              display: "block",
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            🎯 Sujet du quiz
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="ex : Astronomie, Marvel, Histoire de France…"
            autoFocus
            disabled={isLoading}
            style={{
              width: "100%",
              background: "var(--bg-secondary)",
              border: "1.5px solid var(--border-color)",
              borderRadius: "10px",
              padding: "14px 16px",
              color: "var(--text-primary)",
              fontSize: "1rem",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--accent-purple)")
            }
            onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
          />
        </div>

        {/* Player names */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          {/* Player 1 */}
          <div>
            <label
              style={{
                display: "block",
                color: "var(--player1-light)",
                fontSize: "0.82rem",
                fontWeight: 600,
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              🟣 Joueur 1
            </label>
            <input
              type="text"
              value={player1}
              onChange={(e) => setPlayer1(e.target.value)}
              placeholder="Joueur 1"
              disabled={isLoading}
              maxLength={20}
              style={{
                width: "100%",
                background: "var(--bg-secondary)",
                border: "1.5px solid rgba(139,92,246,0.3)",
                borderRadius: "10px",
                padding: "12px 14px",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--player1-color)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(139,92,246,0.3)")
              }
            />
          </div>

          {/* Player 2 */}
          <div>
            <label
              style={{
                display: "block",
                color: "var(--player2-light)",
                fontSize: "0.82rem",
                fontWeight: 600,
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              🔵 Joueur 2
            </label>
            <input
              type="text"
              value={player2}
              onChange={(e) => setPlayer2(e.target.value)}
              placeholder="Joueur 2"
              disabled={isLoading}
              maxLength={20}
              style={{
                width: "100%",
                background: "var(--bg-secondary)",
                border: "1.5px solid rgba(6,182,212,0.3)",
                borderRadius: "10px",
                padding: "12px 14px",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--player2-color)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(6,182,212,0.3)")
              }
            />
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            padding: "14px 16px",
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
          }}
        >
          <span style={{ color: "var(--player1-light)", fontWeight: 600 }}>
            Joueur 1
          </span>{" "}
          — Clavier gauche : <kbd style={kbdStyle}>A</kbd>{" "}
          <kbd style={kbdStyle}>Z</kbd> <kbd style={kbdStyle}>E</kbd>{" "}
          <kbd style={kbdStyle}>R</kbd>
          <br />
          <span style={{ color: "var(--player2-light)", fontWeight: 600 }}>
            Joueur 2
          </span>{" "}
          — Clavier droit : <kbd style={kbdStyle}>U</kbd>{" "}
          <kbd style={kbdStyle}>I</kbd> <kbd style={kbdStyle}>O</kbd>{" "}
          <kbd style={kbdStyle}>P</kbd>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: "10px",
              padding: "12px 16px",
              color: "#fca5a5",
              fontSize: "0.9rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "16px",
            background: isLoading
              ? "rgba(139,92,246,0.3)"
              : "linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))",
            border: "none",
            borderRadius: "12px",
            color: "white",
            fontSize: "1.05rem",
            fontWeight: 700,
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            letterSpacing: "0.05em",
          }}
        >
          {isLoading ? (
            <>
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  border: "2.5px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Génération en cours…
            </>
          ) : (
            "🚀 Générer le quiz !"
          )}
        </button>
      </form>

      {/* Cumulative scoreboard */}
      {cumulative &&
        cumulative.p1Wins + cumulative.p2Wins + cumulative.ties > 0 && (
          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              marginTop: "20px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "16px",
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                🏆 Historique des parties
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY);
                  setCumulative(null);
                }}
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Réinitialiser
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: "8px",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "var(--player1-light)",
                    fontFamily: "'Orbitron', sans-serif",
                  }}
                >
                  {cumulative.p1Wins}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--player1-light)",
                    fontWeight: 600,
                  }}
                >
                  {cumulative.p1Name}
                </div>
              </div>
              <div
                style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}
              >
                {cumulative.ties > 0 && (
                  <div>
                    {cumulative.ties} nul{cumulative.ties > 1 ? "s" : ""}
                  </div>
                )}
                <div style={{ fontSize: "1.2rem" }}>⚔️</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "var(--player2-light)",
                    fontFamily: "'Orbitron', sans-serif",
                  }}
                >
                  {cumulative.p2Wins}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--player2-light)",
                    fontWeight: 600,
                  }}
                >
                  {cumulative.p2Name}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

const kbdStyle: React.CSSProperties = {
  display: "inline-block",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "4px",
  padding: "1px 7px",
  fontFamily: "monospace",
  fontSize: "0.85em",
  color: "var(--text-primary)",
};
