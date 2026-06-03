import { Trophy } from "lucide-react";
import { KartGlyph } from "@/components/KartModel";
import { getRankedPlayers } from "@/lib/game/race";
import type { RoomState } from "@/lib/game/types";

type Props = {
  room: RoomState;
  activePlayerId?: string;
};

export function Leaderboard({ room, activePlayerId }: Props) {
  const players = getRankedPlayers(room);

  if (players.length === 0) {
    return (
      <div className="panel stack">
        <h2 className="title">Leaderboard</h2>
        <p className="muted">No racers yet. Share the room code to fill the grid.</p>
      </div>
    );
  }

  return (
    <section className="panel stack" aria-label="Leaderboard">
      <div className="cluster" style={{ justifyContent: "space-between" }}>
        <h2 className="title">Leaderboard</h2>
        <span className="chip">
          <Trophy size={14} aria-hidden />
          {players.length} racers
        </span>
      </div>
      <div>
        {players.map((player, index) => (
          <div
            className="leader-row"
            key={player.id}
            style={{
              borderColor: activePlayerId === player.id ? "var(--boost-cyan)" : undefined,
              background: activePlayerId === player.id ? "oklch(0.305 0.045 267)" : undefined
            }}
          >
            <strong>#{index + 1}</strong>
            <div style={{ minWidth: 0 }}>
              <div className="cluster" style={{ gap: 8 }}>
                <span
                  aria-hidden
                  style={{
                    display: "inline-grid",
                    height: 28,
                    placeItems: "center",
                    width: 28
                  }}
                >
                  <svg viewBox="0 0 120 180" width="24" height="28">
                    <KartGlyph color={player.color} />
                  </svg>
                </span>
                <strong style={{ overflowWrap: "anywhere" }}>{player.name}</strong>
              </div>
              <small className="muted">
                Week {Math.min(player.currentWeek, 15)} · {player.status}
              </small>
            </div>
            <span className={`chip ${player.connected ? "chip--green" : "chip--coral"}`}>
              {player.connected ? "Live" : "Reconnecting"}
            </span>
            <strong>{player.score}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
