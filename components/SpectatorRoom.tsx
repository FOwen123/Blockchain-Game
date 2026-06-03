"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MonitorUp } from "lucide-react";
import { ConnectionBadge } from "@/components/ConnectionBadge";
import { Leaderboard } from "@/components/Leaderboard";
import { RaceTrack } from "@/components/RaceTrack";
import { getRankedPlayers, normalizeRoomCode } from "@/lib/game/race";
import { getWeek } from "@/lib/game/weeks";
import type { RoomEvent, RoomState } from "@/lib/game/types";
import { useStableClientId } from "@/lib/game/storage";
import { useNow } from "@/lib/game/useNow";
import { useRaceRoom } from "@/lib/realtime/useRaceRoom";

type Props = {
  roomCode: string;
};

export function SpectatorRoom({ roomCode }: Props) {
  const normalizedRoomCode = normalizeRoomCode(roomCode);
  const spectatorId = useStableClientId(`spectator:${normalizedRoomCode}`);
  const [room, setRoom] = useState<RoomState | null>(null);
  const now = useNow(room?.status === "countdown");

  const handleEvent = useCallback((event: RoomEvent) => {
    if (event.type === "host:state") {
      setRoom(event.state);
    }
  }, []);

  const { connection, send } = useRaceRoom({
    roomCode: normalizedRoomCode,
    participantId: spectatorId,
    onEvent: handleEvent
  });

  useEffect(() => {
    if (spectatorId === "spectator-pending") return;
    const request = () => send({ type: "host:request-state", originId: spectatorId });
    void request();
    const timer = window.setInterval(() => void request(), 4000);
    return () => window.clearInterval(timer);
  }, [send, spectatorId]);

  const currentWeek = room ? getWeek(room.activeWeek) : undefined;
  const countdownRemaining =
    now > 0 && room?.status === "countdown" && room.countdownEndsAt
      ? Math.max(0, Math.ceil((room.countdownEndsAt - now) / 1000))
      : 0;

  return (
    <main className="screen screen--wide screen--spectator stack" style={{ gap: "var(--space-lg)" }}>
      <header className="cluster" style={{ justifyContent: "space-between" }}>
        <div className="cluster">
          <Link className="button button--ghost" href="/">
            Back
          </Link>
          <span className="chip chip--amber">Spectator · {normalizedRoomCode}</span>
          <ConnectionBadge connection={connection} />
        </div>
        <Link className="button button--primary" href={`/play/${normalizedRoomCode}`}>
          Join race
        </Link>
      </header>

      {!room ? (
        <section className="panel stack" style={{ minHeight: 360, placeContent: "center" }}>
          <MonitorUp size={38} aria-hidden />
          <h1 className="headline">Waiting for host state</h1>
          <p className="muted">
            Open the host page for room {normalizedRoomCode}. This screen will update when the host broadcasts the race.
          </p>
        </section>
      ) : (
        <section className="split spectator-layout">
          <div className="stack">
            <div className="panel stack">
              <div className="cluster" style={{ justifyContent: "space-between" }}>
                <div>
                  <h1 className="headline">Tokyo Chain Rally</h1>
                  <p className="muted" style={{ margin: "8px 0 0" }}>
                    Room {normalizedRoomCode} · {room.status}
                  </p>
                </div>
                {room.status === "countdown" ? (
                  <span className="countdown-number">{countdownRemaining}</span>
                ) : (
                  <span className="chip chip--cyan">{Object.keys(room.players).length} racers</span>
                )}
              </div>
            </div>
            <RaceTrack room={room} />
            <div className="panel stack">
              <span className="chip chip--amber">Week {currentWeek?.id}</span>
              <h2 className="headline">{currentWeek?.title}</h2>
              <p className="muted">{currentWeek?.spectatorCallout}</p>
            </div>
          </div>

          <aside className="stack">
            {room.status === "finished" && <Podium room={room} />}
            <Leaderboard room={room} />
            <div className="panel stack">
              <h2 className="title">Course map</h2>
              <p className="muted">
                The race covers 15 weeks, from distributed ledgers through risk management and auditing.
              </p>
              <div className="stack" style={{ gap: 8 }}>
                {Array.from({ length: 15 }, (_, index) => index + 1).map((weekId) => {
                  const week = getWeek(weekId);
                  return (
                    <div className="cluster" key={week.id} style={{ justifyContent: "space-between" }}>
                      <span className={`chip ${week.id === room.activeWeek ? "chip--amber" : ""}`}>W{week.id}</span>
                      <span className="muted" style={{ flex: 1, minWidth: 0 }}>
                        {week.shortTitle}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}

function Podium({ room }: { room: RoomState }) {
  const podium = getRankedPlayers(room).slice(0, 3);

  return (
    <section className="panel stack" aria-label="Final podium">
      <div className="cluster" style={{ justifyContent: "space-between" }}>
        <h2 className="title">Final podium</h2>
        <span className="chip chip--green">Finish</span>
      </div>
      <div className="podium-grid">
        {podium.map((player, index) => (
          <div className={`podium-card podium-card--${index + 1}`} key={player.id}>
            <span className="podium-rank">#{index + 1}</span>
            <strong>{player.name}</strong>
            <span className="muted">{player.score} pts</span>
          </div>
        ))}
      </div>
    </section>
  );
}
