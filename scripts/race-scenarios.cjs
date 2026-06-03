/* eslint-disable @typescript-eslint/no-require-imports */

const { execFileSync } = require("node:child_process");
const { rmSync } = require("node:fs");
const { join } = require("node:path");
const { tmpdir } = require("node:os");
const Module = require("node:module");
const assert = require("node:assert/strict");

const projectRoot = process.cwd();
const outDir = join(tmpdir(), "blockchain-game-race-scenarios");
process.env.NODE_PATH = [join(projectRoot, "node_modules"), process.env.NODE_PATH].filter(Boolean).join(":");
Module._initPaths();

rmSync(outDir, { force: true, recursive: true });
execFileSync(
  "pnpm",
  [
    "exec",
    "tsc",
    "lib/game/race.ts",
    "lib/game/weeks.ts",
    "lib/game/types.ts",
    "--ignoreConfig",
    "--types",
    "node",
    "--module",
    "Node16",
    "--moduleResolution",
    "node16",
    "--target",
    "es2022",
    "--esModuleInterop",
    "--skipLibCheck",
    "--outDir",
    outDir
  ],
  { cwd: projectRoot, stdio: "inherit" }
);

const race = require(join(outDir, "race.js"));
const weeksModule = require(join(outDir, "weeks.js"));

const {
  addOrRefreshPlayer,
  applyAnswer,
  createPlayer,
  createRoomState,
  endRace,
  forceNextCheckpoint,
  getRankedPlayers,
  normalizeRoomCode,
  playerProgressPercent,
  setLocked,
  startRaceNow
} = race;
const { getWeek, weeks } = weeksModule;

const colors = [
  "oklch(0.820 0.145 205)",
  "oklch(0.830 0.145 78)",
  "oklch(0.735 0.165 25)"
];

function player(id, name, color = colors[0]) {
  return createPlayer({ id, name, color, avatar: "TOKYO" });
}

function answer(room, playerId, weekId, answerId, offset) {
  return applyAnswer(room, {
    playerId,
    weekId,
    answerId,
    at: 1_800_000_000_000 + offset
  });
}

function assertPlayer(room, id) {
  const found = room.players[id];
  assert.ok(found, `Expected player ${id} to exist`);
  return found;
}

assert.equal(normalizeRoomCode("fall! room"), "FALLRO");
assert.equal(weeks.length, 15);

let room = createRoomState("class");
room = addOrRefreshPlayer(room, player("p1", "Alpha", colors[0]));
room = addOrRefreshPlayer(room, player("p2", "Beta", colors[1]));
room = addOrRefreshPlayer(room, player("p3", "Gamma", colors[2]));
assert.equal(Object.keys(room.players).length, 3);

const duplicateRoom = addOrRefreshPlayer(room, player("p4", "alpha", colors[2]));
assert.equal(Object.keys(duplicateRoom.players).length, 3);
assert.match(duplicateRoom.hostMessage ?? "", /already on the grid/i);

const lockedRoom = setLocked(room, true);
const lateRoom = addOrRefreshPlayer(lockedRoom, player("late", "Late", colors[2]));
assert.equal(lateRoom.players.late, undefined);
assert.match(lateRoom.hostMessage ?? "", /after the room was locked/i);

room = startRaceNow(room);
assert.equal(room.status, "racing");

let offset = 0;
for (const week of weeks) {
  room = answer(room, "p1", week.id, getWeek(week.id).correctAnswerId, offset += 10);
  room = answer(room, "p2", week.id, "b", offset += 10);
  room = answer(room, "p3", week.id, week.id % 2 === 0 ? getWeek(week.id).correctAnswerId : "b", offset += 10);
}

assert.equal(room.status, "finished");
assert.equal(playerProgressPercent(assertPlayer(room, "p1")), 100);
assert.equal(assertPlayer(room, "p1").score, 1800);
assert.equal(assertPlayer(room, "p1").boosts, 15);
assert.equal(assertPlayer(room, "p1").slowdowns, 0);
assert.equal(assertPlayer(room, "p2").score, 525);
assert.equal(assertPlayer(room, "p2").boosts, 0);
assert.equal(assertPlayer(room, "p2").slowdowns, 15);
assert.equal(assertPlayer(room, "p3").progress, 15);
assert.equal(assertPlayer(room, "p3").status, "finished");
assert.deepEqual(getRankedPlayers(room).map((ranked) => ranked.id), ["p1", "p3", "p2"]);

let tieRoom = startRaceNow(createRoomState("tie"));
tieRoom = addOrRefreshPlayer(tieRoom, player("fast", "Tie Fast", colors[0]));
tieRoom = addOrRefreshPlayer(tieRoom, player("slow", "Tie Slow", colors[1]));
tieRoom = answer(tieRoom, "fast", 1, getWeek(1).correctAnswerId, 1);
tieRoom = answer(tieRoom, "slow", 1, getWeek(1).correctAnswerId, 100);
assert.deepEqual(getRankedPlayers(tieRoom).map((ranked) => ranked.id), ["fast", "slow"]);

let recoveryRoom = startRaceNow(createRoomState("recover"));
recoveryRoom = addOrRefreshPlayer(recoveryRoom, player("recovering", "Recovering", colors[0]));
recoveryRoom = forceNextCheckpoint(recoveryRoom);
assert.equal(assertPlayer(recoveryRoom, "recovering").currentWeek, 2);
assert.equal(recoveryRoom.activeWeek, 2);
recoveryRoom = endRace(recoveryRoom);
assert.equal(recoveryRoom.status, "finished");

console.log("Race scenario checks passed: full 15-checkpoint race, wrong/all-correct scoring, tie ordering, late join, duplicate name, and host recovery.");
