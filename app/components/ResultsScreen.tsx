"use client";

import { AnswerRecord } from "./QuizScreen";
import { loadScores, GameMode } from "./SetupScreen";

interface ResultsScreenProps {
  player1: string;
  player2: string;
  answers: AnswerRecord[];
  mode: GameMode;
  onReplay: () => void;
}

export default function ResultsScreen({
  player1,
  player2,
  answers,
  mode,
  onReplay,
}: ResultsScreenProps) {
  // Normal mode: count correct answers. Speed mode: count speedWinner points.
  const p1Score =
    mode === "speed"
      ? answers.filter((a) => a.speedWinner === "p1").length
      : answers.filter((a) => a.p1Choice === a.correctIndex).length;
  const p2Score =
    mode === "speed"
      ? answers.filter((a) => a.speedWinner === "p2").length
      : answers.filter((a) => a.p2Choice === a.correctIndex).length;
  const cumulative = loadScores();

  const maxScore = answers.length;
  const p1Pct = (p1Score / maxScore) * 100;
  const p2Pct = (p2Score / maxScore) * 100;

  let winnerText = "";
  let winnerColor = "";
  if (p1Score > p2Score) {
    winnerText = `🏆 ${player1} remporte le duel !`;
    winnerColor = "var(--player1-light)";
  } else if (p2Score > p1Score) {
    winnerText = `🏆 ${player2} remporte le duel !`;
    winnerColor = "var(--player2-light)";
  } else {
    winnerText = "🤝 Match nul !";
    winnerColor = "#f59e0b";
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "32px 24px 48px",
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 60%), var(--bg-primary)",
        animation: "fadeIn 0.5s ease",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Winner banner */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "40px",
            animation: "bounceIn 0.6s cubic-bezier(0.36,0.07,0.19,0.97)",
          }}
        >
          <p
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              fontWeight: 900,
              color: winnerColor,
              marginBottom: "8px",
              textShadow: `0 0 20px ${winnerColor}88`,
            }}
          >
            {winnerText}
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Quiz terminé — {maxScore} questions
            {mode === "speed"
              ? " · ⚡ Mode Rapidité"
              : mode === "intrus"
                ? " · 🔍 Mode Intrus"
                : ""}
          </p>
        </div>

        {/* Cumulative scoreboard strip */}
        {cumulative &&
          cumulative.p1Wins + cumulative.p2Wins + cumulative.ties > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "24px",
                marginBottom: "32px",
                padding: "14px 24px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "12px",
                fontSize: "0.85rem",
              }}
            >
              <span style={{ color: "var(--text-secondary)" }}>⚔️ Total :</span>
              <span style={{ color: "var(--player1-light)", fontWeight: 700 }}>
                {cumulative.p1Name} {cumulative.p1Wins}V
              </span>
              {cumulative.ties > 0 && (
                <span style={{ color: "#f59e0b" }}>
                  {cumulative.ties} nul{cumulative.ties > 1 ? "s" : ""}
                </span>
              )}
              <span style={{ color: "var(--player2-light)", fontWeight: 700 }}>
                {cumulative.p2Wins}V {cumulative.p2Name}
              </span>
            </div>
          )}

        {/* Score cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {[
            {
              name: player1,
              score: p1Score,
              color: "var(--player1-color)",
              light: "var(--player1-light)",
              pct: p1Pct,
            },
            {
              name: player2,
              score: p2Score,
              color: "var(--player2-color)",
              light: "var(--player2-light)",
              pct: p2Pct,
            },
          ].map((p, pi) => (
            <div
              key={pi}
              style={{
                background: "var(--bg-card)",
                border: `1px solid ${p.color}44`,
                borderRadius: "16px",
                padding: "28px",
                textAlign: "center",
                boxShadow: `0 8px 30px ${p.color}22`,
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: `${p.color}22`,
                  border: `2px solid ${p.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: p.light,
                  margin: "0 auto 16px",
                }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: p.light,
                  marginBottom: "10px",
                }}
              >
                {p.name}
              </p>
              <p
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "3rem",
                  fontWeight: 900,
                  color: p.light,
                  lineHeight: 1,
                  marginBottom: "12px",
                }}
              >
                {p.score}
                <span
                  style={{ fontSize: "1.2rem", color: "var(--text-secondary)" }}
                >
                  /{maxScore}
                </span>
              </p>
              {/* Score bar */}
              <div
                style={{
                  height: "6px",
                  background: "var(--border-color)",
                  borderRadius: "3px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${p.pct}%`,
                    background: p.color,
                    borderRadius: "3px",
                    transition: "width 1s ease 0.3s",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Question breakdown */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid var(--border-color)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <h2
              style={{
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Détail des réponses
            </h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                  <th style={thStyle}>#</th>
                  <th style={{ ...thStyle, textAlign: "left" }}>Question</th>
                  <th style={{ ...thStyle, color: "var(--player1-light)" }}>
                    {player1}
                  </th>
                  <th style={{ ...thStyle, color: "var(--player2-light)" }}>
                    {player2}
                  </th>
                </tr>
              </thead>
              <tbody>
                {answers.map((a, i) => {
                  const p1ok = a.p1Choice === a.correctIndex;
                  const p2ok = a.p2Choice === a.correctIndex;
                  return (
                    <tr
                      key={i}
                      style={{
                        borderTop: "1px solid var(--border-color)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.03)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td
                        style={{
                          ...tdStyle,
                          color: "var(--text-secondary)",
                          fontWeight: 700,
                        }}
                      >
                        {i + 1}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "left",
                          fontSize: "0.88rem",
                          maxWidth: "320px",
                        }}
                      >
                        <span
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {a.question}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background:
                              a.p1Choice === null
                                ? "rgba(255,255,255,0.06)"
                                : p1ok
                                  ? "rgba(34,197,94,0.2)"
                                  : "rgba(239,68,68,0.2)",
                            fontSize: "0.9rem",
                          }}
                        >
                          {a.p1Choice === null ? "–" : p1ok ? "✓" : "✗"}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background:
                              a.p2Choice === null
                                ? "rgba(255,255,255,0.06)"
                                : p2ok
                                  ? "rgba(34,197,94,0.2)"
                                  : "rgba(239,68,68,0.2)",
                            fontSize: "0.9rem",
                          }}
                        >
                          {a.p2Choice === null ? "–" : p2ok ? "✓" : "✗"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Replay button */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={onReplay}
            style={{
              padding: "16px 48px",
              background:
                "linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontSize: "1.05rem",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.05em",
              transition: "transform 0.15s, box-shadow 0.15s",
              boxShadow: "0 8px 24px rgba(139,92,246,0.4)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1.04)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 12px 32px rgba(139,92,246,0.55)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 8px 24px rgba(139,92,246,0.4)";
            }}
          >
            🔄 Rejouer
          </button>
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  textAlign: "center",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "center",
  color: "var(--text-primary)",
  verticalAlign: "middle",
};
