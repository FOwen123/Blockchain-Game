"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FastForward, Flag, Lock, RotateCcw, Unlock, Users, XCircle } from "lucide-react";
import { ConnectionBadge } from "@/components/ConnectionBadge";
import { Leaderboard } from "@/components/Leaderboard";
import { QrCode } from "@/components/QrCode";
import { RaceTrack } from "@/components/RaceTrack";
import {
  addOrRefreshPlayer,
  applyAnswer,
  clearExpiredEffects,
  createRoomState,
  endRace,
  forceNextCheckpoint,
  kickPlayer,
  markHeartbeat,
  normalizeRoomCode,
  resetRoom,
  setLocked,
  startCountdown,
  startRaceNow
} from "@/lib/game/race";
import { getWeek } from "@/lib/game/weeks";
import type { RoomEvent, RoomState } from "@/lib/game/types";
import { useStableClientId } from "@/lib/game/storage";
import { useNow } from "@/lib/game/useNow";
import { playSound, setSoundMuted } from "@/lib/game/sound";
import { useRaceRoom } from "@/lib/realtime/useRaceRoom";

type Props = {
  roomCode: string;
};

export function HostRoom({ roomCode }: Props) {
  const normalizedRoomCode = normalizeRoomCode(roomCode);
  const hostId = useStableClientId(`host:${normalizedRoomCode}`);
  const [muted, setMuted] = useState(false);
  const [room, setRoom] = useState<RoomState>(() => createRoomState(normalizedRoomCode));
  const roomRef = useRef(room);
  const sendRef = useRef<(event: RoomEvent) => Promise<void> | void>(() => undefined);
  const now = useNow(room.status === "countdown");

  const handleEvent = useCallback(
    (event: RoomEvent) => {
      if (event.originId === hostId) return;
      if (event.type === "player:join") {
        setRoom((current) => addOrRefreshPlayer(current, event.player));
      }
      if (event.type === "player:answer") {
        setRoom((current) => applyAnswer(current, event));
        void playSound("checkpoint");
      }
      if (event.type === "player:heartbeat") {
        setRoom((current) => markHeartbeat(current, event.playerId));
      }
      if (event.type === "host:request-state") {
        void sendRef.current({ type: "host:state", originId: hostId, state: roomRef.current });
      }
    },
    [hostId]
  );

  const { connection, presenceIds, send } = useRaceRoom({
    roomCode: normalizedRoomCode,
    participantId: hostId,
    onEvent: handleEvent
  });

  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  useEffect(() => {
    roomRef.current = room;
    void send({ type: "host:state", originId: hostId, state: room });
  }, [hostId, room, send]);

  useEffect(() => {
    if (presenceIds.length === 0) return;
    const onlineIds = new Set(presenceIds);
    queueMicrotask(() => {
      setRoom((current) => {
        let changed = false;
        const now = Date.now();
        const players = Object.fromEntries(
          Object.entries(current.players).map(([id, player]) => {
            const connected = onlineIds.has(id) || now - player.updatedAt < 15000;
            if (player.connected === connected) {
              return [id, player];
            }
            changed = true;
            return [id, { ...player, connected }];
          })
        );
        return changed ? { ...current, players } : current;
      });
    });
  }, [presenceIds]);

  useEffect(() => {
    if (room.status !== "countdown" || !room.countdownEndsAt) return;
    const timer = window.setInterval(() => {
      if (Date.now() >= (room.countdownEndsAt ?? 0)) {
        setRoom((current) => startRaceNow(current));
        void playSound("countdown");
      }
    }, 200);
    return () => window.clearInterval(timer);
  }, [room.countdownEndsAt, room.status]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRoom((current) => clearExpiredEffects(markStalePlayers(current)));
    }, 1500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setSoundMuted(muted);
    window.localStorage.setItem("tokyo-chain-rally:muted", String(muted));
  }, [muted]);

  const joinUrl = useMemo(() => {
    if (typeof window === "undefined") return `/play/${normalizedRoomCode}`;
    return `${window.location.origin}/play/${normalizedRoomCode}`;
  }, [normalizedRoomCode]);

  const spectatorUrl = `/spectator/${normalizedRoomCode}`;
  const currentWeek = getWeek(room.activeWeek);
  const countdownRemaining =
    now > 0 && room.status === "countdown" && room.countdownEndsAt
      ? Math.max(0, Math.ceil((room.countdownEndsAt - now) / 1000))
      : 0;

  return (
    <main className="screen screen--wide stack" style={{ gap: "var(--space-lg)" }}>
      <header className="cluster" style={{ justifyContent: "space-between" }}>
        <div className="cluster">
          <Link className="button button--ghost" href="/">
            Back
          </Link>
          <span className="chip chip--amber">Host · {normalizedRoomCode}</span>
          <ConnectionBadge connection={connection} />
        </div>
        <Link className="button button--secondary" href={spectatorUrl}>
          Open spectator
        </Link>
      </header>

      <section className="split">
        <div className="stack">
          <div className="panel stack">
            <div className="cluster" style={{ justifyContent: "space-between" }}>
              <div>
                <h1 className="headline">Host control grid</h1>
                <p className="muted" style={{ margin: "8px 0 0" }}>
                  Room state is broadcast from this browser. Keep this tab open during class.
                </p>
              </div>
              <span className="chip">
                <Users size={14} aria-hidden />
                {Object.keys(room.players).length} players
              </span>
            </div>
            <div className="cluster">
              <button
                className="button button--primary"
                disabled={room.status !== "lobby" && room.status !== "resetting"}
                onClick={() => {
                  setRoom((current) => startCountdown(current));
                  void playSound("countdown");
                }}
                type="button"
              >
                <Flag size={18} aria-hidden />
                Start countdown
              </button>
              <button
                className="button button--secondary"
                onClick={() => setRoom((current) => setLocked(current, !current.locked))}
                type="button"
              >
                {room.locked ? <Unlock size={18} aria-hidden /> : <Lock size={18} aria-hidden />}
                {room.locked ? "Unlock joins" : "Lock joins"}
              </button>
              <button
                className="button button--secondary"
                onClick={() => setRoom((current) => forceNextCheckpoint(current))}
                type="button"
              >
                <FastForward size={18} aria-hidden />
                Force checkpoint
              </button>
              <button
                className="button button--danger"
                onClick={() => setRoom((current) => endRace(current))}
                type="button"
              >
                <XCircle size={18} aria-hidden />
                End race
              </button>
              <button
                className="button button--ghost"
                onClick={() => setRoom((current) => resetRoom(current))}
                type="button"
              >
                <RotateCcw size={18} aria-hidden />
                Reset room
              </button>
              <button className="button button--ghost" onClick={() => setMuted((value) => !value)} type="button">
                {muted ? "Unmute sounds" : "Mute sounds"}
              </button>
            </div>
            {room.status === "countdown" && (
              <div className="panel panel--raised" aria-live="polite">
                <span className="countdown-number">{countdownRemaining}</span>
              </div>
            )}
          </div>

          <RaceTrack room={room} />
        </div>

        <aside className="stack">
          <div className="panel stack">
            <div>
              <h2 className="title">Join code</h2>
              <p className="muted">Show this QR code before the countdown.</p>
            </div>
            <QrCode value={joinUrl} />
            <div className="cluster">
              <span className="chip chip--cyan">{normalizedRoomCode}</span>
              <span className={`chip ${room.locked ? "chip--coral" : "chip--green"}`}>
                {room.locked ? "Locked" : "Open"}
              </span>
            </div>
          </div>

          <div className="panel stack">
            <h2 className="title">Current checkpoint</h2>
            <span className="chip chip--amber">Week {currentWeek.id}</span>
            <strong>{currentWeek.title}</strong>
            <p className="muted">{currentWeek.spectatorCallout}</p>
            <small className="muted">{room.hostMessage}</small>
          </div>

          <Leaderboard room={room} />

          {Object.values(room.players).length > 0 && (
            <div className="panel stack">
              <h2 className="title">Player recovery</h2>
              {Object.values(room.players).map((player) => (
                <button
                  className="button button--ghost"
                  key={player.id}
                  onClick={() => setRoom((current) => kickPlayer(current, player.id))}
                  type="button"
                >
                  Remove {player.name}
                </button>
              ))}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

function markStalePlayers(room: RoomState): RoomState {
  const now = Date.now();
  const players = Object.fromEntries(
    Object.entries(room.players).map(([id, player]) => [
      id,
      {
        ...player,
        connected: now - player.updatedAt < 15000
      }
    ])
  );
  return { ...room, players };
}
