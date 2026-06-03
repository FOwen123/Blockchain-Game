"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Gamepad2, Volume2, VolumeX } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { KartGlyph } from "@/components/KartModel";
import { ConnectionBadge } from "@/components/ConnectionBadge";
import { Leaderboard } from "@/components/Leaderboard";
import { RaceCockpit } from "@/components/RaceCockpit";
import { RaceTrack } from "@/components/RaceTrack";
import {
  createPlayer,
  getPlayerRank,
  kartColors,
  normalizeRoomCode,
  playerProgressPercent,
  sanitizePlayerName
} from "@/lib/game/race";
import { getWeek } from "@/lib/game/weeks";
import type { Player, RoomEvent, RoomState } from "@/lib/game/types";
import { getOrCreateClientId, getStoredPlayer, setStoredPlayer, type StoredPlayer } from "@/lib/game/storage";
import { playSound, setSoundMuted } from "@/lib/game/sound";
import { useNow } from "@/lib/game/useNow";
import { useRaceRoom } from "@/lib/realtime/useRaceRoom";

type Props = {
  roomCode: string;
};

const kartColorLabels = [
  "Boost cyan",
  "Checkpoint amber",
  "Slowdown coral",
  "Finish green",
  "Gate violet",
  "Neon rose"
];

const defaultCarAvatar = "TOKYO";

export function PlayerRoom({ roomCode }: Props) {
  const normalizedRoomCode = normalizeRoomCode(roomCode);
  const [profile, setProfile] = useState<StoredPlayer | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(kartColors[0]);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [answered, setAnswered] = useState<{ weekId: number; answerId: string }>();
  const [muted, setMuted] = useState(false);
  const [joinSent, setJoinSent] = useState(false);
  const [preparingReplay, setPreparingReplay] = useState(false);
  const now = useNow(room?.status === "countdown");

  useEffect(() => {
    const stored = getStoredPlayer(normalizedRoomCode);
    const nextProfile =
      stored ??
      ({
        id: getOrCreateClientId(`player:${normalizedRoomCode}`),
        name: "",
        color: kartColors[0],
        avatar: defaultCarAvatar
      } satisfies StoredPlayer);
    queueMicrotask(() => {
      setProfile(nextProfile);
      setName(nextProfile.name);
      setColor(nextProfile.color);
      setMuted(window.localStorage.getItem("tokyo-chain-rally:muted") === "true");
    });
  }, [normalizedRoomCode]);

  useEffect(() => {
    setSoundMuted(muted);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("tokyo-chain-rally:muted", String(muted));
    }
  }, [muted]);

  const participantId = profile?.id ?? "player-pending";

  const handleEvent = useCallback(
    (event: RoomEvent) => {
      if (event.type === "host:state") {
        setRoom(event.state);
      }
    },
    []
  );

  const { connection, send } = useRaceRoom({
    roomCode: normalizedRoomCode,
    participantId,
    onEvent: handleEvent
  });

  useEffect(() => {
    if (participantId === "player-pending") return;
    void send({ type: "host:request-state", originId: participantId });
  }, [participantId, send]);

  useEffect(() => {
    if (!profile || !joinSent) return;
    const timer = window.setInterval(() => {
      void send({ type: "player:heartbeat", originId: profile.id, playerId: profile.id, at: Date.now() });
    }, 4500);
    return () => window.clearInterval(timer);
  }, [joinSent, profile, send]);

  const player = profile && room ? room.players[profile.id] : undefined;
  const selectedAnswer =
    player && answered?.weekId === player.currentWeek ? answered.answerId : undefined;

  const joined = Boolean(player) && !preparingReplay;
  const canJoin = Boolean(profile && sanitizePlayerName(name));
  const roomLocked = room?.locked && !joined;
  const roomFinished = room?.status === "finished";
  const connectionOffline = connection === "offline";

  useEffect(() => {
    if (!profile || !room || joinSent || preparingReplay || roomFinished || connectionOffline) return;
    if (!profile.name.trim()) return;

    if (room.players[profile.id]) {
      queueMicrotask(() => setJoinSent(true));
      return;
    }

    queueMicrotask(() => {
      const nextProfile = {
        ...profile,
        name: sanitizePlayerName(profile.name),
        color: profile.color || color,
        avatar: profile.avatar || defaultCarAvatar
      };
      setProfile(nextProfile);
      setName(nextProfile.name);
      setColor(nextProfile.color);
      setStoredPlayer(normalizedRoomCode, nextProfile);
      setJoinSent(true);
      void send({ type: "player:join", originId: nextProfile.id, player: createPlayer(nextProfile) });
    });
  }, [color, connectionOffline, joinSent, normalizedRoomCode, preparingReplay, profile, room, roomFinished, send]);

  const joinRace = useCallback(async () => {
    if (!profile || !canJoin || roomFinished || connectionOffline) return;
    const nextProfile = {
      ...profile,
      name: sanitizePlayerName(name),
      color,
      avatar: profile.avatar || defaultCarAvatar
    };
    setProfile(nextProfile);
    setStoredPlayer(normalizedRoomCode, nextProfile);
    setJoinSent(true);
    setPreparingReplay(false);
    const nextPlayer: Player = createPlayer(nextProfile);
    await send({ type: "player:join", originId: nextProfile.id, player: nextPlayer });
    await playSound("checkpoint");
  }, [canJoin, color, connectionOffline, name, normalizedRoomCode, profile, roomFinished, send]);

  const answerQuestion = useCallback(
    async (answerId: string) => {
      if (!profile || !player || selectedAnswer || connectionOffline) return;
      const week = getWeek(player.currentWeek);
      setAnswered({ weekId: player.currentWeek, answerId });
      await playSound(answerId === week.correctAnswerId ? "correct" : "wrong");
      await send({
        type: "player:answer",
        originId: profile.id,
        playerId: profile.id,
        weekId: player.currentWeek,
        answerId,
        at: Date.now()
      });
    },
    [connectionOffline, player, profile, selectedAnswer, send]
  );

  const rank = player && room ? getPlayerRank(room, player.id) : 0;
  const currentWeek = player ? getWeek(Math.min(player.currentWeek, 15)) : undefined;
  const completionTime = formatCompletionTime(room?.startedAt, player?.finishedAt);
  const countdownRemaining =
    now > 0 && room?.status === "countdown" && room.countdownEndsAt
      ? Math.max(0, Math.ceil((room.countdownEndsAt - now) / 1000))
      : 0;

  return (
    <main className="screen stack" style={{ gap: "var(--space-lg)" }}>
      <header className="cluster" style={{ justifyContent: "space-between" }}>
        <div className="cluster">
          <Link className="button button--ghost" href="/">
            Back
          </Link>
          <span className="chip chip--cyan">Player · {normalizedRoomCode}</span>
        </div>
        <div className="cluster">
          <ConnectionBadge connection={connection} />
          <button className="button button--ghost" onClick={() => setMuted((value) => !value)} type="button">
            {muted ? <VolumeX size={18} aria-hidden /> : <Volume2 size={18} aria-hidden />}
            <span className="sr-only">{muted ? "Unmute sounds" : "Mute sounds"}</span>
          </button>
        </div>
      </header>

      {!joined ? (
        <section className="split" style={{ alignItems: "start" }}>
          <div className="panel stack">
            <div className="cluster">
              <span className="chip chip--amber">Room {normalizedRoomCode}</span>
              {roomLocked && <span className="chip chip--coral">Locked</span>}
            </div>
            <h1 className="headline">Join the grid</h1>
            <p className="muted">
              Pick a short name and a neon accent color. The host starts the race from the projector.
            </p>
            <label className="stack" style={{ gap: 8 }}>
              <span className="chip">Racer name</span>
              <input
                className="input"
                maxLength={18}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                value={name}
              />
            </label>
            <div className="stack" style={{ gap: 8 }}>
              <span className="chip">Car accent</span>
              <div className="kart-picker">
                {kartColors.map((kartColor, index) => (
                  <button
                    aria-label={`Choose ${kartColorLabels[index]} kart color`}
                    aria-pressed={color === kartColor}
                    className="kart-swatch"
                    key={kartColor}
                    onClick={() => setColor(kartColor)}
                    style={{ background: kartColor }}
                    type="button"
                  >
                    <span className="sr-only">{kartColorLabels[index]}</span>
                    <span aria-hidden className="kart-swatch__mark">
                      {color === kartColor ? "✓" : ""}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <CarPreview color={color} />
            <button className="button button--primary" disabled={!canJoin || roomLocked || roomFinished || connectionOffline} onClick={joinRace} type="button">
              <Gamepad2 size={18} aria-hidden />
              Join race
            </button>
            {connectionOffline && <p className="muted">Connection is offline. Reconnect before joining or answering.</p>}
            {joinSent && !room && <p className="muted">Waiting for host state. Keep this screen open.</p>}
            {joinSent && room && !player && (
              <p className="muted">
                {room.hostMessage ?? "The host has not added this racer yet. Check the room code or try a different name."}
              </p>
            )}
            {roomFinished && (
              <p className="muted">This race has finished. Ask the host to reset the room before replaying.</p>
            )}
          </div>

          <div className="panel stack">
            <h2 className="title">How the phone view works</h2>
            <p className="muted">
              The car auto-runs to each checkpoint. Steer with the buttons or keyboard, then answer when the checkpoint pauses the road.
            </p>
          </div>
        </section>
      ) : (
        <section className="player-race-layout">
          <div className="stack">
            <div className="panel stack">
              <div className="cluster" style={{ justifyContent: "space-between" }}>
                <div className="cluster">
                  <span className="chip chip--cyan">Rank #{rank || "-"}</span>
                  <span className="chip">Score {player?.score ?? 0}</span>
                  <span className="chip">{playerProgressPercent(player)}%</span>
                </div>
                <span className={`chip ${player?.connected ? "chip--green" : "chip--coral"}`}>
                  {player?.connected ? "Connected" : "Reconnecting"}
                </span>
              </div>
              {room?.status === "countdown" ? (
                <div aria-live="polite">
                  <p className="muted">Race starts in</p>
                  <span className="countdown-number">{countdownRemaining}</span>
                </div>
              ) : room?.status === "lobby" ? (
                <p className="muted">You are on the grid. Wait for the host countdown.</p>
              ) : room?.status === "finished" || player?.status === "finished" ? (
                <div className="stack">
                  <h1 className="headline">Finish line crossed</h1>
                  <p className="muted">
                    Rank #{rank || "-"} · Score {player?.score ?? 0} · Time {completionTime}. Watch the projector for the podium.
                  </p>
                  <button
                    className="button button--secondary"
                    onClick={() => {
                      setPreparingReplay(true);
                      setAnswered(undefined);
                    }}
                    type="button"
                  >
                    Prepare replay
                  </button>
                </div>
              ) : (
                currentWeek && (
                  <div className="stack">
                    <span className="chip chip--amber">Week {currentWeek.id}</span>
                    <h1 className="title">{currentWeek.shortTitle}</h1>
                    <p className="muted">{currentWeek.spectatorCallout}</p>
                  </div>
                )
              )}
            </div>

            {room && player && room.status !== "finished" && player.status !== "finished" ? (
              <RaceCockpit
                disabled={room.status !== "racing" || connectionOffline}
                onAnswer={answerQuestion}
                player={player}
                rank={rank}
                selectedAnswer={selectedAnswer}
                totalPlayers={Object.keys(room.players).length}
              />
            ) : (
              room && <RaceTrack activePlayerId={profile?.id} compact room={room} />
            )}
          </div>

          <aside className="stack">
            {room && <Leaderboard activePlayerId={profile?.id} room={room} />}
          </aside>
        </section>
      )}
    </main>
  );
}

function formatCompletionTime(startedAt?: number, finishedAt?: number) {
  if (!startedAt || !finishedAt) return "--";
  const totalSeconds = Math.max(0, Math.round((finishedAt - startedAt) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function CarPreview({ color }: { color: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="car-garage" aria-label="Selected car preview">
      <div className="cluster" style={{ justifyContent: "space-between" }}>
        <span className="chip chip--cyan">Your kart</span>
        <span className="muted">Live preview</span>
      </div>
      <svg className="car-garage__svg" viewBox="0 0 220 118" role="img" aria-label="Preview of selected neon race car">
        <defs>
          <filter id="garageCarShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="2" dy="4" floodColor="oklch(0.08 0 0 / 0.45)" stdDeviation="2" />
          </filter>
          <filter id="kartModelGlow" x="-35%" y="-25%" width="170%" height="150%">
            <feDropShadow dx="0" dy="6" floodColor="oklch(0.82 0.145 205 / 0.36)" stdDeviation="5" />
          </filter>
        </defs>
        <rect width="220" height="118" rx="8" fill="oklch(0.155 0.035 270)" />
        <path
          d="M -8 85 C 37 68 67 72 104 58 C 143 43 171 33 230 39"
          fill="none"
          stroke="oklch(0.33 0.032 264)"
          strokeLinecap="round"
          strokeWidth="38"
        />
        <path
          d="M -8 85 C 37 68 67 72 104 58 C 143 43 171 33 230 39"
          fill="none"
          stroke="oklch(0.82 0.145 205 / 0.5)"
          strokeDasharray="9 15"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <g opacity="0.45">
          <circle cx="36" cy="29" fill="none" r="9" stroke="var(--boost-cyan)" strokeWidth="2" />
          <path d="M 30 29 H 42 M 36 23 V 35" stroke="var(--boost-cyan)" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M 178 82 L 188 72 L 198 82 L 188 92 Z" fill="none" stroke="var(--checkpoint-amber)" strokeWidth="2" />
        </g>
        <motion.g
          key={color}
          animate={{ x: 112, y: 62, rotate: -16, scale: 0.36 }}
          initial={reduceMotion ? false : { x: 88, y: 68, rotate: -24, scale: 0.32 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <g transform="translate(-60 -90)">
            <KartGlyph color={color} />
          </g>
        </motion.g>
      </svg>
    </div>
  );
}
