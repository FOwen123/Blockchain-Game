"use client";

import { useEffect, useRef, useState, type CSSProperties, type MutableRefObject } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Gauge, Keyboard, Trophy, Zap } from "lucide-react";
import { KartModel } from "@/components/KartModel";
import { playerProgressPercent } from "@/lib/game/race";
import { getWeek } from "@/lib/game/weeks";
import type { Player } from "@/lib/game/types";

type Props = {
  player: Player;
  rank: number;
  totalPlayers: number;
  disabled?: boolean;
  selectedAnswer?: string;
  onAnswer: (answerId: string) => void;
};

type DriveAction = "boost" | "left" | "right" | "brake";
type DrivePace = "ready" | "boosting" | "slowed";
type DriveInput = Record<DriveAction, boolean>;
type DriveState = { x: number; velocity: number; lift: number; roadOffset: number; segmentProgress: number; engine: number };
type RoadProjection = { x: number; y: number; laneUnit: number; safeLaneWidth: number };

const controlBindings = [
  { action: "boost", keys: ["ArrowUp", "w", "W"], label: "↑", copy: "Boost", gridArea: "up" },
  { action: "left", keys: ["ArrowLeft", "a", "A"], label: "←", copy: "Left", gridArea: "left" },
  { action: "right", keys: ["ArrowRight", "d", "D"], label: "→", copy: "Right", gridArea: "right" },
  { action: "brake", keys: ["ArrowDown", "s", "S"], label: "↓", copy: "Brake", gridArea: "down" }
] satisfies Array<{ action: DriveAction; keys: string[]; label: string; copy: string; gridArea: string }>;

const answerKeys = ["1", "2", "3", "4"];
const checkpointDriveMs = 3400;
const roadLaneLimit = 46;
const roadHorizonY = 19;
const roadBottomY = 118;
const roadCenterX = 110;
const roadSafeLaneHorizon = 2.5;
const roadSafeLaneBottom = 24;
const roadViewBoxWidth = 220;
const speedLineOffsets = [12, 24, 36, 48, 60, 72, 84, 96];
const emptyDriveInput: DriveInput = { boost: false, left: false, right: false, brake: false };
const initialDriveState: DriveState = { x: 0, velocity: 0, lift: 0, roadOffset: 0, segmentProgress: 0, engine: 0 };

export function RaceCockpit({ player, rank, totalPlayers, disabled = false, selectedAnswer, onAnswer }: Props) {
  return (
    <RaceCockpitRound
      disabled={disabled}
      key={`${player.id}-${player.currentWeek}`}
      onAnswer={onAnswer}
      player={player}
      rank={rank}
      selectedAnswer={selectedAnswer}
      totalPlayers={totalPlayers}
    />
  );
}

function RaceCockpitRound({ player, rank, totalPlayers, disabled = false, selectedAnswer, onAnswer }: Props) {
  const week = getWeek(player.currentWeek);
  const reduceMotion = useReducedMotion();
  const answeringLocked = disabled || Boolean(selectedAnswer);
  const [checkpointOpen, setCheckpointOpen] = useState(false);
  const [drive, setDrive] = useState<DriveState>(initialDriveState);
  const [stageWidth, setStageWidth] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<DriveInput>(emptyDriveInput);
  const progress = playerProgressPercent(player);
  const segmentPace: DrivePace =
    player.lastAnswer?.weekId === player.currentWeek - 1 ? (player.lastAnswer.correct ? "boosting" : "slowed") : "ready";
  const speed = disabled ? 0 : segmentPace === "boosting" || drive.lift < 0 ? 185 : segmentPace === "slowed" || drive.lift > 0 ? 72 : 148;
  const lastCorrect = player.lastAnswer?.correct;
  const checkpointVisible = checkpointOpen && !disabled && !selectedAnswer;
  const drivingToGate = !disabled && !checkpointOpen && !selectedAnswer;
  const driveProgress = Math.min(99, Math.round(drive.segmentProgress * 100));
  const pickupProgress = Math.min(1, drive.segmentProgress / 0.96);
  const laneUnit = getLaneUnit(drive.x);
  const roadUnitPx = (stageWidth || 760) / roadViewBoxWidth;
  const roadX = laneUnit * roadSafeLaneBottom * roadUnitPx;
  const pickupProjection = projectRoadLane(drive.x, 0.16 + pickupProgress * 0.84);
  const pickupX = pickupProjection.x;
  const pickupY = pickupProjection.y;
  const pickupScale = 0.42 + pickupProgress * 0.82;
  const pickupOpacity = checkpointOpen ? 0 : 0.55 + pickupProgress * 0.45;
  const stageStyle = {
    "--drive-progress": `${Math.round(drive.segmentProgress * 100)}%`,
    "--drive-progress-scale": drive.segmentProgress
  } as CSSProperties;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const stageElement = stage;

    function syncStageWidth() {
      setStageWidth(stageElement.getBoundingClientRect().width);
    }

    syncStageWidth();
    const resizeObserver = new ResizeObserver(syncStageWidth);
    resizeObserver.observe(stageElement);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const answerIndex = answerKeys.indexOf(event.key);
      const answerOption = week.options[answerIndex];
      if (checkpointVisible && !answeringLocked && answerOption) {
        event.preventDefault();
        onAnswer(answerOption.id);
        return;
      }

      const movement = getControlBinding(event.key);
      if (!movement || disabled) return;

      event.preventDefault();
      setControlInput(inputRef, movement.action, true);
    }

    function handleKeyUp(event: KeyboardEvent) {
      const movement = getControlBinding(event.key);
      if (!movement) return;

      event.preventDefault();
      setControlInput(inputRef, movement.action, false);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      inputRef.current = emptyDriveInput;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [answeringLocked, checkpointVisible, disabled, onAnswer, week.options]);

  useEffect(() => {
    if (disabled || selectedAnswer) return;

    const paceMultiplier = segmentPace === "boosting" ? 0.76 : segmentPace === "slowed" ? 1.22 : 1;
    const roadSpeed = segmentPace === "boosting" ? 520 : segmentPace === "slowed" ? 210 : 340;
    const driveDuration = checkpointDriveMs * paceMultiplier;
    let elapsed = 0;
    let pickupHit = false;
    let lastFrame = performance.now();
    let frame = 0;

    function animateDrive(time: number) {
      const delta = Math.min(time - lastFrame, 34);
      lastFrame = time;
      const input = inputRef.current;
      const inputPace = input.boost ? 1.14 : input.brake ? 0.78 : 1;
      if (!pickupHit) {
        elapsed += delta * inputPace;
      }
      const nextProgress = Math.min(elapsed / driveDuration, 1);

      if (nextProgress >= 1 && !pickupHit) {
        pickupHit = true;
        setCheckpointOpen(true);
      }

      setDrive((current) => ({
        ...advanceDriveState(current, input, delta / 1000, delta, roadSpeed, pickupHit),
        segmentProgress: nextProgress
      }));

      frame = window.requestAnimationFrame(animateDrive);
    }

    frame = window.requestAnimationFrame(animateDrive);
    return () => window.cancelAnimationFrame(frame);
  }, [disabled, player.currentWeek, selectedAnswer, segmentPace]);

  return (
    <section className="cockpit" aria-label={`Week ${week.id} driving question`}>
      <div className="landscape-hint" aria-live="polite">
        Turn your phone sideways for the racing controls.
      </div>

      <div
        className={`cockpit__stage ${checkpointOpen ? "cockpit__stage--checkpoint" : "cockpit__stage--driving"}`}
        ref={stageRef}
        style={stageStyle}
      >
        <div className="cockpit__hud">
          <div className="cluster" style={{ justifyContent: "space-between" }}>
            <div className="cluster">
              <span className="chip chip--amber">Week {week.id}</span>
              <span className="chip">
                <Gauge size={14} aria-hidden />
                {speed} km/h
              </span>
              <span className="chip">
                <Trophy size={14} aria-hidden />
                {rank || "-"} / {Math.max(totalPlayers, 1)}
              </span>
            </div>
            <div className="cluster">
              <span className={`chip ${checkpointOpen ? "chip--amber" : "chip--cyan"}`}>
                {checkpointOpen ? "Question hit" : `${driveProgress}% to ?`}
              </span>
              <span className="chip chip--cyan">{progress}% race</span>
            </div>
          </div>
        </div>

        <div className="cockpit__sky" aria-hidden="true">
          <span className="cockpit__horizon" />
          <span className="cockpit__network cockpit__network--left" />
          <span className="cockpit__network cockpit__network--right" />
        </div>

        <svg className="cockpit__road" viewBox="0 0 220 118" aria-hidden="true">
          <path d="M 110 19 L 208 118 H 12 Z" fill="oklch(0.17 0.045 264)" />
          <path d="M 110 19 L 208 118" fill="none" stroke="var(--boost-cyan)" strokeWidth="2.4" />
          <path d="M 110 19 L 12 118" fill="none" stroke="var(--boost-cyan)" strokeWidth="2.4" />
          <path
            className="cockpit-road__dash"
            d="M 110 25 L 110 118"
            fill="none"
            stroke="oklch(0.93 0.03 220)"
            strokeDasharray="6 8"
            strokeDashoffset={-drive.roadOffset}
            strokeLinecap="round"
            strokeWidth="2.4"
          />
          <path className="cockpit-road__lane" d="M 91 48 L 65 118" fill="none" opacity="0.6" stroke="oklch(0.82 0.145 205 / 0.55)" strokeDasharray="8 9" strokeDashoffset={-drive.roadOffset * 0.7} strokeWidth="1.2" />
          <path className="cockpit-road__lane" d="M 129 48 L 155 118" fill="none" opacity="0.6" stroke="oklch(0.82 0.145 205 / 0.55)" strokeDasharray="8 9" strokeDashoffset={-drive.roadOffset * 0.7} strokeWidth="1.2" />
          <g className="cockpit-road__gate" transform="translate(110 43)">
            <line stroke="var(--checkpoint-amber)" strokeLinecap="round" strokeWidth="3" x1="-38" x2="38" y1="0" y2="0" />
            <line stroke="var(--checkpoint-amber)" strokeLinecap="round" strokeWidth="2" x1="-38" x2="-38" y1="-9" y2="9" />
            <line stroke="var(--checkpoint-amber)" strokeLinecap="round" strokeWidth="2" x1="38" x2="38" y1="-9" y2="9" />
            <text fill="var(--tunnel-bg)" fontSize="7" fontWeight="900" textAnchor="middle" y="2.6">
              {week.id}
            </text>
          </g>
          <g
            className="cockpit-road__question-pickup"
            opacity={pickupOpacity}
            transform={`translate(${pickupX} ${pickupY}) scale(${pickupScale})`}
          >
            <circle cx="0" cy="0" fill="oklch(0.08 0.02 270)" r="7.8" stroke="var(--checkpoint-amber)" strokeWidth="1.8" />
            <circle cx="0" cy="0" fill="none" r="11.5" stroke="var(--boost-cyan)" strokeDasharray="2 3" strokeWidth="1.1" />
            <text
              fill="var(--checkpoint-amber)"
              fontFamily="var(--font-oxanium), var(--font-sora), sans-serif"
              fontSize="12"
              fontWeight="900"
              textAnchor="middle"
              y="4.2"
            >
              ?
            </text>
          </g>
        </svg>

        <div className="cockpit__speedlines" aria-hidden="true">
          {speedLineOffsets.map((left, index) => (
            <span key={left} style={{ "--speedline-left": `${left}%`, "--speedline-delay": `${index * -0.19}s` } as CSSProperties} />
          ))}
        </div>

        <motion.div
          animate={{
            x: roadX + (segmentPace === "slowed" ? -6 : segmentPace === "boosting" ? 6 : 0),
            y: checkpointOpen ? 7 : drive.lift + (reduceMotion ? 0 : Math.sin(drive.engine / 120) * 2),
            rotate: Math.max(-5, Math.min(5, drive.velocity / 55)),
            scale: segmentPace === "boosting" ? 1.06 : checkpointOpen ? 0.98 : 1
          }}
          className={`cockpit-car ${checkpointOpen ? "cockpit-car--parked" : ""}`}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="cockpit-car__shadow" aria-hidden="true" />
          <KartModel
            ariaLabel={`${player.name}'s selected car`}
            className="cockpit-car__model"
            color={player.color}
          />
        </motion.div>

        <div className="checkpoint-modal" aria-live="polite">
          {checkpointVisible ? (
            <div className="checkpoint-card">
              <div className="cluster" style={{ justifyContent: "space-between" }}>
                <span className="chip chip--amber">Checkpoint {week.id}</span>
                <span className="chip">Press 1-3</span>
              </div>
              <div className="stack" style={{ gap: 8 }}>
                <h1>{week.question}</h1>
                <p>{week.highlight}</p>
              </div>
              <div className="checkpoint-answers">
                {week.options.map((option, index) => (
                  <button
                    className="answer-button"
                    disabled={answeringLocked}
                    key={option.id}
                    onClick={() => onAnswer(option.id)}
                    type="button"
                  >
                    <strong>{index + 1}</strong>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : drivingToGate ? (
            <div className="checkpoint-card checkpoint-card--drive">
              <div className="cluster" style={{ justifyContent: "space-between" }}>
                <span className="chip chip--cyan">Auto-driving</span>
                <span className="chip">{driveProgress}%</span>
              </div>
              <div className="stack" style={{ gap: 8 }}>
                <h1>Hit the ? pickup</h1>
                <p>{week.shortTitle}. Steer while the car auto-runs; the question opens when the pickup reaches your car.</p>
              </div>
              <div className="drive-meter" aria-hidden="true">
                <span />
              </div>
            </div>
          ) : player.lastAnswer ? (
            <div className="checkpoint-card checkpoint-card--result">
              <span className={`chip ${lastCorrect ? "chip--cyan" : "chip--coral"}`}>
                {lastCorrect ? "Boost earned" : "Slowdown taken"}
              </span>
              <p>{getWeek(player.lastAnswer.weekId).highlight}</p>
            </div>
          ) : null}
        </div>

        <div className="cockpit__status" aria-live="polite">
          {answeringLocked && player.lastAnswer ? (
            <span className={`chip ${lastCorrect ? "chip--cyan" : "chip--coral"}`}>
              {lastCorrect ? "Boost earned" : "Slowdown taken"}
            </span>
          ) : disabled ? (
            <span className="chip">
              <Zap size={14} aria-hidden />
              Waiting for start
            </span>
          ) : checkpointVisible ? (
            <span className="chip chip--amber">
              <Keyboard size={14} aria-hidden />
              Question pickup hit, press 1-3
            </span>
          ) : (
            <span className="chip">
              <Keyboard size={14} aria-hidden />
              Auto-drive active, steer into the ?
            </span>
          )}
        </div>

        <div className="cockpit__controls">
          <div className="cockpit__dpad" aria-label="Driving controls">
            {controlBindings.map((binding) => {
              return (
                <button
                  aria-label={`${binding.copy} driving control`}
                  className="cockpit-button"
                  disabled={disabled}
                  key={binding.action}
                  onClick={() => setDrive((current) => nudgeDriveState(current, binding.action))}
                  onPointerCancel={() => setControlInput(inputRef, binding.action, false)}
                  onPointerDown={() => setControlInput(inputRef, binding.action, true)}
                  onPointerLeave={() => setControlInput(inputRef, binding.action, false)}
                  onPointerUp={() => setControlInput(inputRef, binding.action, false)}
                  style={{ gridArea: binding.gridArea }}
                  type="button"
                >
                  <span className="cockpit-button__arrow">{binding.label}</span>
                  <span className="cockpit-button__copy">{binding.copy}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function getControlBinding(key: string) {
  return controlBindings.find((binding) => binding.keys.includes(key));
}

function setControlInput(inputRef: MutableRefObject<DriveInput>, action: DriveAction, active: boolean) {
  inputRef.current = { ...inputRef.current, [action]: active };
}

function getLaneUnit(x: number) {
  return Math.max(-1, Math.min(1, x / roadLaneLimit));
}

function projectRoadLane(x: number, progress: number): RoadProjection {
  const depth = Math.max(0, Math.min(1, progress));
  const laneUnit = getLaneUnit(x);
  const safeLaneWidth = roadSafeLaneHorizon + (roadSafeLaneBottom - roadSafeLaneHorizon) * depth;

  return {
    laneUnit,
    safeLaneWidth,
    x: roadCenterX + laneUnit * safeLaneWidth,
    y: roadHorizonY + (roadBottomY - roadHorizonY) * depth
  };
}

function clampRoadX(x: number) {
  return getLaneUnit(x) * roadLaneLimit;
}

function advanceDriveState(
  current: DriveState,
  input: DriveInput,
  deltaSeconds: number,
  deltaMs: number,
  roadSpeed: number,
  gateReached: boolean
): DriveState {
  const direction = Number(input.right) - Number(input.left);
  const acceleration = input.boost ? 740 : 610;
  const friction = direction === 0 ? 0.78 : 0.92;
  const maxVelocity = input.boost ? 430 : 340;
  let velocity = (current.velocity + direction * acceleration * deltaSeconds) * friction;
  velocity = Math.max(-maxVelocity, Math.min(maxVelocity, velocity));
  if (direction === 0 && Math.abs(velocity) < 4) velocity = 0;

  let x = current.x + velocity * deltaSeconds;
  if (x < -roadLaneLimit || x > roadLaneLimit) {
    x = clampRoadX(x);
    velocity = 0;
  }

  const roadModifier = input.boost ? 170 : input.brake ? -130 : 0;
  const nextRoadOffset = gateReached ? current.roadOffset : (current.roadOffset + Math.max(90, roadSpeed + roadModifier) * deltaSeconds) % 48;
  const targetLift = input.boost ? -14 : input.brake ? 12 : 0;
  const lift = current.lift + (targetLift - current.lift) * Math.min(deltaMs / 95, 1);

  return {
    ...current,
    engine: current.engine + deltaMs,
    lift,
    roadOffset: nextRoadOffset,
    velocity,
    x
  };
}

function nudgeDriveState(current: DriveState, action: DriveAction): DriveState {
  if (action === "left") {
    return { ...current, lift: 0, velocity: -160, x: clampRoadX(current.x - 12) };
  }
  if (action === "right") {
    return { ...current, lift: 0, velocity: 160, x: clampRoadX(current.x + 12) };
  }
  if (action === "brake") {
    return { ...current, lift: 12, velocity: current.velocity * 0.7 };
  }
  return { ...current, lift: -14, velocity: current.velocity * 1.12 };
}
