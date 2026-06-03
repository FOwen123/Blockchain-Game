"use client";

import { useId, useMemo } from "react";

export type StoredPlayer = {
  id: string;
  name: string;
  color: string;
  avatar: string;
};

const keyPrefix = "tokyo-chain-rally";

export function getStoredPlayer(roomCode: string): StoredPlayer | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(`${keyPrefix}:${roomCode}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredPlayer;
  } catch {
    return null;
  }
}

export function setStoredPlayer(roomCode: string, player: StoredPlayer) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${keyPrefix}:${roomCode}`, JSON.stringify(player));
}

export function getOrCreateClientId(role: string) {
  if (typeof window === "undefined") return `${role}-server`;
  const key = `${keyPrefix}:${role}:id`;
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const id = `${role}-${crypto.randomUUID()}`;
  window.localStorage.setItem(key, id);
  return id;
}

export function useStableClientId(role: string) {
  const reactId = useId();
  return useMemo(() => `${role}-${reactId.replace(/[^a-z0-9]/gi, "")}`, [reactId, role]);
}
