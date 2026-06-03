"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Flag, Gamepad2, Shuffle } from "lucide-react";
import { generateRoomCode, normalizeRoomCode } from "@/lib/game/race";

export function Home() {
  const [roomCode, setRoomCode] = useState("CHAIN");
  const normalized = normalizeRoomCode(roomCode);

  return (
    <main className="screen stack" style={{ gap: "var(--space-xl)" }}>
      <section className="split" style={{ alignItems: "center" }}>
        <div className="stack" style={{ gap: "var(--space-lg)" }}>
          <div className="cluster">
            <span className="chip chip--cyan">Tokyo Chain Rally</span>
            <span className="chip chip--amber">15 checkpoints</span>
          </div>
          <div className="stack">
            <h1 className="display">Race through Financial Blockchain.</h1>
            <p className="muted" style={{ maxWidth: 680 }}>
              Create one room, show the spectator map on the projector, and let classmates answer one quick question for each course week.
            </p>
          </div>
        </div>
        <div className="panel stack">
          <label className="stack" style={{ gap: 8 }}>
            <span className="chip">Room code</span>
            <input
              className="input"
              maxLength={6}
              onChange={(event) => setRoomCode(event.target.value)}
              value={roomCode}
            />
          </label>
          <button className="button button--secondary" onClick={() => setRoomCode(generateRoomCode())} type="button">
            <Shuffle size={18} aria-hidden />
            Generate code
          </button>
        </div>
      </section>

      <section className="mode-grid" aria-label="Choose game mode">
        <Link className="mode-link" href={`/host/${normalized}`}>
          <Flag size={26} aria-hidden />
          <h2 className="title">Host room</h2>
          <p className="muted">Start countdowns, lock joins, reset the race, and control recovery.</p>
        </Link>
        <Link className="mode-link" href={`/play/${normalized}`}>
          <Gamepad2 size={26} aria-hidden />
          <h2 className="title">Join on phone</h2>
          <p className="muted">Pick a racer name, answer checkpoints, and chase boosts.</p>
        </Link>
        <Link className="mode-link" href={`/spectator/${normalized}`}>
          <Eye size={26} aria-hidden />
          <h2 className="title">Spectator view</h2>
          <p className="muted">Show the class map, current week, and live leaderboard.</p>
        </Link>
      </section>
    </main>
  );
}
