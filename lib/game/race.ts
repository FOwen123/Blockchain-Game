import { getWeek, weeks } from "./weeks";
import type { Player, RoomState } from "./types";

export const kartColors = [
  "oklch(0.820 0.145 205)",
  "oklch(0.830 0.145 78)",
  "oklch(0.735 0.165 25)",
  "oklch(0.790 0.135 150)",
  "oklch(0.715 0.155 286)",
  "oklch(0.880 0.110 330)"
];

export const avatars = ["A", "B", "C", "D", "E", "F"];

export function normalizeRoomCode(roomCode: string) {
  return roomCode.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase() || "CHAIN";
}

export function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export function createRoomState(roomCode: string): RoomState {
  return {
    roomCode: normalizeRoomCode(roomCode),
    status: "lobby",
    locked: false,
    activeWeek: 1,
    players: {},
    revision: 0,
    hostMessage: "Room ready. Share the QR code and wait for racers."
  };
}

export function createPlayer(input: {
  id: string;
  name: string;
  color: string;
  avatar: string;
}): Player {
  const now = Date.now();
  return {
    id: input.id,
    name: sanitizePlayerName(input.name),
    color: input.color,
    avatar: input.avatar,
    score: 0,
    progress: 0,
    currentWeek: 1,
    boosts: 0,
    slowdowns: 0,
    status: "ready",
    connected: true,
    joinedAt: now,
    updatedAt: now
  };
}

export function sanitizePlayerName(name: string) {
  const cleaned = name.trim().replace(/\s+/g, " ").slice(0, 18);
  return cleaned || "Racer";
}

export function addOrRefreshPlayer(room: RoomState, player: Player): RoomState {
  if (room.locked && !room.players[player.id]) {
    return {
      ...room,
      hostMessage: `${player.name} tried to join after the room was locked.`
    };
  }

  const duplicateName = Object.values(room.players).find((existingPlayer) => {
    return existingPlayer.id !== player.id && existingPlayer.name.toLowerCase() === player.name.toLowerCase();
  });

  if (duplicateName) {
    return bumpRoom({
      ...room,
      hostMessage: `${player.name} is already on the grid. Pick another racer name.`
    });
  }

  return bumpRoom({
    ...room,
    players: {
      ...room.players,
      [player.id]: {
        ...player,
        ...(room.players[player.id] ?? {}),
        name: player.name,
        color: player.color,
        avatar: player.avatar,
        connected: true,
        updatedAt: Date.now()
      }
    },
    hostMessage: `${player.name} is on the grid.`
  });
}

export function markHeartbeat(room: RoomState, playerId: string): RoomState {
  const player = room.players[playerId];
  if (!player) return room;
  return {
    ...room,
    players: {
      ...room.players,
      [playerId]: {
        ...player,
        connected: true,
        updatedAt: Date.now()
      }
    }
  };
}

export function startCountdown(room: RoomState): RoomState {
  const now = Date.now();
  return bumpRoom({
    ...room,
    status: "countdown",
    countdownEndsAt: now + 3200,
    startedAt: now + 3200,
    hostMessage: "Countdown started."
  });
}

export function startRaceNow(room: RoomState): RoomState {
  return bumpRoom({
    ...room,
    status: "racing",
    startedAt: room.startedAt ?? Date.now(),
    countdownEndsAt: undefined,
    hostMessage: "Race live."
  });
}

export function resetRoom(room: RoomState): RoomState {
  return createRoomState(room.roomCode);
}

export function setLocked(room: RoomState, locked: boolean): RoomState {
  return bumpRoom({
    ...room,
    locked,
    hostMessage: locked ? "Late joins locked." : "Late joins open."
  });
}

export function kickPlayer(room: RoomState, playerId: string): RoomState {
  const players = { ...room.players };
  const name = players[playerId]?.name ?? "Racer";
  delete players[playerId];
  return bumpRoom({
    ...room,
    players,
    hostMessage: `${name} was removed from the grid.`
  });
}

export function forceNextCheckpoint(room: RoomState): RoomState {
  const players = Object.fromEntries(
    Object.entries(room.players).map(([id, player]) => {
      if (player.status === "finished") return [id, player];
      const nextWeek = Math.min(player.currentWeek + 1, weeks.length + 1);
      return [
        id,
        {
          ...player,
          currentWeek: nextWeek,
          progress: Math.min(player.progress + 1, weeks.length),
          status: nextWeek > weeks.length ? "finished" : "ready",
          finishedAt: nextWeek > weeks.length ? Date.now() : player.finishedAt,
          updatedAt: Date.now()
        }
      ];
    })
  );
  return finishIfComplete(
    bumpRoom({
      ...room,
      players,
      activeWeek: Math.min(room.activeWeek + 1, weeks.length),
      hostMessage: "Host advanced the race checkpoint."
    })
  );
}

export function endRace(room: RoomState): RoomState {
  return bumpRoom({
    ...room,
    status: "finished",
    finishedAt: Date.now(),
    hostMessage: "Race ended by host."
  });
}

export function applyAnswer(
  room: RoomState,
  input: { playerId: string; weekId: number; answerId: string; at: number }
): RoomState {
  if (room.status !== "racing" && room.status !== "countdown") return room;
  const activeRoom = room.status === "countdown" ? startRaceNow(room) : room;
  const player = activeRoom.players[input.playerId];
  if (!player || player.status === "finished") return activeRoom;
  if (player.currentWeek !== input.weekId) return activeRoom;

  const week = getWeek(input.weekId);
  const correct = week.correctAnswerId === input.answerId;
  const nextWeek = input.weekId + 1;
  const finished = nextWeek > weeks.length;
  const updatedPlayer: Player = {
    ...player,
    score: player.score + (correct ? 120 : 35),
    progress: Math.min(player.progress + 1, weeks.length),
    currentWeek: Math.min(nextWeek, weeks.length + 1),
    boosts: player.boosts + (correct ? 1 : 0),
    slowdowns: player.slowdowns + (correct ? 0 : 1),
    status: finished ? "finished" : correct ? "boosting" : "slowed",
    finishedAt: finished ? input.at : player.finishedAt,
    updatedAt: input.at,
    lastAnswer: {
      weekId: input.weekId,
      answerId: input.answerId,
      correct,
      at: input.at
    }
  };

  const nextRoom = bumpRoom({
    ...activeRoom,
    activeWeek: getActiveWeek({
      ...activeRoom.players,
      [input.playerId]: updatedPlayer
    }),
    players: {
      ...activeRoom.players,
      [input.playerId]: updatedPlayer
    },
    hostMessage: `${player.name} cleared Week ${input.weekId}.`
  });

  return finishIfComplete(nextRoom);
}

export function clearExpiredEffects(room: RoomState): RoomState {
  const now = Date.now();
  const players = Object.fromEntries(
    Object.entries(room.players).map(([id, player]) => {
      if (
        player.status !== "boosting" &&
        player.status !== "slowed"
      ) {
        return [id, player];
      }
      if (!player.lastAnswer || now - player.lastAnswer.at < 1400) {
        return [id, player];
      }
      return [id, { ...player, status: "ready" as const }];
    })
  );
  return { ...room, players };
}

export function getRankedPlayers(room: RoomState) {
  return Object.values(room.players).sort((a, b) => {
    if (b.progress !== a.progress) return b.progress - a.progress;
    if (b.score !== a.score) return b.score - a.score;
    return (a.finishedAt ?? a.updatedAt) - (b.finishedAt ?? b.updatedAt);
  });
}

export function getPlayerRank(room: RoomState, playerId: string) {
  return getRankedPlayers(room).findIndex((player) => player.id === playerId) + 1;
}

export function playerProgressPercent(player?: Player) {
  if (!player) return 0;
  return Math.min(100, Math.round((player.progress / weeks.length) * 100));
}

function getActiveWeek(players: Record<string, Player>) {
  const active = Object.values(players)
    .filter((player) => player.status !== "finished")
    .map((player) => player.currentWeek);
  return Math.min(...active, weeks.length);
}

function finishIfComplete(room: RoomState): RoomState {
  const players = Object.values(room.players);
  if (players.length > 0 && players.every((player) => player.status === "finished")) {
    return bumpRoom({
      ...room,
      status: "finished",
      finishedAt: Date.now(),
      hostMessage: "All racers finished."
    });
  }
  return room;
}

function bumpRoom(room: RoomState): RoomState {
  return {
    ...room,
    revision: room.revision + 1
  };
}
