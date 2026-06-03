"use client";

import { motion, useReducedMotion } from "motion/react";
import { KartGlyph } from "@/components/KartModel";
import { RaceMapTopicIcon } from "@/components/RaceMapIcons";
import {
  COURSE_BACKGROUND_DOTS,
  COURSE_CHECKPOINTS,
  COURSE_DIRECTION_MARKERS,
  COURSE_MAP_HEIGHT,
  COURSE_MAP_VIEWBOX,
  COURSE_MAP_WIDTH,
  COURSE_TOPIC_MARKERS,
  EVEN_CHECKPOINT_TONE,
  ODD_CHECKPOINT_TONE,
  buildCourseRoadPath,
  getRaceCarPosition,
  sampleCourseRoad
} from "@/lib/game/courseMap";
import { getRankedPlayers, playerProgressPercent } from "@/lib/game/race";
import type { Player, RoomState } from "@/lib/game/types";

type Props = {
  room: RoomState;
  activePlayerId?: string;
  compact?: boolean;
};

const ROAD_LAYERS = [
  { id: "shadow", opacity: 0.88, stroke: "oklch(0.04 0.015 270)", strokeWidth: 13.6 },
  { id: "outer-rail", filter: "url(#trackGlow)", opacity: 0.55, stroke: "oklch(0.42 0.07 255)", strokeWidth: 11.2 },
  { id: "asphalt", stroke: "url(#roadSurface)", strokeWidth: 9.6 },
  { id: "inner-depth", opacity: 0.85, stroke: "oklch(0.14 0.04 265)", strokeWidth: 7.8 },
  { id: "lane-dashes", opacity: 0.7, stroke: "oklch(0.62 0.07 255)", strokeDasharray: "2.8 5.8", strokeWidth: 0.55 },
  { id: "energy-wire", filter: "url(#trackGlow)", opacity: 0.72, stroke: "oklch(0.82 0.145 205)", strokeDasharray: "0.7 10", strokeWidth: 0.72 }
];

const FINISH_CELLS = Array.from({ length: 12 }, (_, index) => {
  const col = index % 2;
  const row = Math.floor(index / 2);
  return { col, row, dark: (col + row) % 2 === 0 };
});

export function RaceTrack({ room, activePlayerId, compact = false }: Props) {
  const reduceMotion = useReducedMotion();
  const players = getRankedPlayers(room);

  return (
    <section className="race-world race-world--topdown" aria-label="Top-down race track">
      <svg className="track-svg" viewBox={COURSE_MAP_VIEWBOX} role="img" aria-label="Top-down 15-week financial blockchain race map">
        <MapDefinitions />
        <BackgroundGrid />
        <MapHeader compact={compact} />
        <TopicLayer compact={compact} />
        <RoadLayer />
        <CourseFlowArrows />
        <StartFinishLine />
        <CheckpointLayer activeWeek={room.activeWeek} compact={compact} />
        <PlayerLayer activePlayerId={activePlayerId} players={players} reduceMotion={Boolean(reduceMotion)} />
      </svg>
    </section>
  );
}

function MapDefinitions() {
  return (
    <defs>
      <radialGradient id="mapVignette" cx="50%" cy="48%" r="72%">
        <stop offset="0%" stopColor="oklch(0.19 0.048 262)" stopOpacity="1" />
        <stop offset="68%" stopColor="oklch(0.12 0.034 270)" stopOpacity="1" />
        <stop offset="100%" stopColor="oklch(0.06 0.022 270)" stopOpacity="1" />
      </radialGradient>
      <radialGradient id="mapGlowCyan" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="oklch(0.82 0.145 205 / 0.14)" />
        <stop offset="100%" stopColor="oklch(0.82 0.145 205 / 0)" />
      </radialGradient>
      <radialGradient id="mapGlowAmber" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="oklch(0.83 0.145 78 / 0.1)" />
        <stop offset="100%" stopColor="oklch(0.83 0.145 78 / 0)" />
      </radialGradient>
      <linearGradient id="roadSurface" x1="0%" x2="100%" y1="0%" y2="100%">
        <stop offset="0%" stopColor="oklch(0.24 0.05 262)" />
        <stop offset="48%" stopColor="oklch(0.17 0.042 268)" />
        <stop offset="100%" stopColor="oklch(0.26 0.048 258)" />
      </linearGradient>
      <linearGradient id="panelGlow" x1="0%" x2="100%" y1="0%" y2="100%">
        <stop offset="0%" stopColor="oklch(0.82 0.145 205 / 0.16)" />
        <stop offset="100%" stopColor="oklch(0.715 0.155 286 / 0.05)" />
      </linearGradient>
      <pattern id="mapCircuitGrid" width="16" height="16" patternUnits="userSpaceOnUse">
        <path d="M 16 0 H 0 V 16" fill="none" stroke="oklch(0.5 0.06 255)" strokeOpacity="0.06" strokeWidth="0.3" />
      </pattern>
      <filter id="trackGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="0.9" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="mapGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="1.4" result="mapBlur" />
        <feMerge>
          <feMergeNode in="mapBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

function BackgroundGrid() {
  return (
    <g aria-hidden="true">
      <rect width={COURSE_MAP_WIDTH} height={COURSE_MAP_HEIGHT} fill="url(#mapVignette)" />
      <rect width={COURSE_MAP_WIDTH} height={COURSE_MAP_HEIGHT} fill="url(#mapCircuitGrid)" />
      <ellipse cx="22" cy="18" fill="url(#mapGlowCyan)" rx="28" ry="20" />
      <ellipse cx="138" cy="72" fill="url(#mapGlowAmber)" rx="24" ry="18" />
      {COURSE_BACKGROUND_DOTS.map((dot, index) => (
        <circle
          cx={dot.x}
          cy={dot.y}
          fill={index % 4 === 0 ? "var(--boost-cyan)" : "oklch(0.72 0.045 255)"}
          key={`${dot.x}-${dot.y}`}
          opacity={dot.opacity}
          r={index % 4 === 0 ? "0.28" : "0.18"}
        />
      ))}
    </g>
  );
}

function RoadLayer() {
  const roadPath = buildCourseRoadPath();

  return (
    <g aria-hidden="true">
      {ROAD_LAYERS.map((layer) => (
        <path
          d={roadPath}
          fill="none"
          filter={layer.filter}
          key={layer.id}
          opacity={layer.opacity}
          stroke={layer.stroke}
          strokeDasharray={layer.strokeDasharray}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={layer.strokeWidth}
        />
      ))}
    </g>
  );
}

function CourseFlowArrows() {
  return (
    <g aria-hidden="true" opacity="0.58">
      {COURSE_DIRECTION_MARKERS.map((marker) => (
        <g key={`${marker.x}-${marker.y}`} transform={`translate(${marker.x} ${marker.y}) rotate(${marker.angle})`}>
          <path d="M -2.2 -1.5 L 1.8 0 L -2.2 1.5" fill="none" stroke={marker.tone} strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.65" />
        </g>
      ))}
    </g>
  );
}

function CheckpointLayer({ activeWeek, compact }: { activeWeek: number; compact: boolean }) {
  return (
    <g aria-hidden="true">
      {COURSE_CHECKPOINTS.map((checkpoint) => (
        <CheckpointGate
          angle={checkpoint.angle}
          compact={compact}
          isActive={checkpoint.week.id === activeWeek}
          key={checkpoint.week.id}
          tone={checkpoint.tone}
          weekId={checkpoint.week.id}
          x={checkpoint.x}
          y={checkpoint.y}
        />
      ))}
    </g>
  );
}

function CheckpointGate({
  angle,
  compact,
  isActive,
  tone,
  weekId,
  x,
  y
}: {
  angle: number;
  compact: boolean;
  isActive: boolean;
  tone: string;
  weekId: number;
  x: number;
  y: number;
}) {
  const labelSize = compact ? 2.35 : isActive ? 2.85 : 2.55;
  const labelOffset = weekId === 1 ? -5.4 : weekId === 15 ? 5.4 : weekId % 2 === 0 ? -4.2 : 4.2;
  const gateWidth = isActive ? 6.2 : 5.2;
  const badgeSize = isActive ? 6.8 : 5.8;

  return (
    <g filter={isActive ? "url(#mapGlow)" : undefined} transform={`translate(${x} ${y}) rotate(${angle + 90})`}>
      {isActive && <rect fill={tone} height="8.6" opacity="0.2" rx="1.6" width="17" x="-8.5" y="-4.3" />}
      <line opacity={isActive ? 0.42 : 0.28} stroke="oklch(0.94 0.025 250)" strokeLinecap="round" strokeWidth={isActive ? 2.2 : 1.6} x1={-gateWidth} x2={gateWidth} y1="0" y2="0" />
      <line stroke={tone} strokeLinecap="round" strokeOpacity={isActive ? 1 : 0.82} strokeWidth={isActive ? 1.55 : 1.15} x1={-gateWidth} x2={gateWidth} y1="0" y2="0" />
      <line opacity={isActive ? 0.82 : 0.55} stroke={tone} strokeLinecap="round" strokeWidth="0.75" x1={-gateWidth} x2={-gateWidth} y1="-2.6" y2="2.6" />
      <line opacity={isActive ? 0.82 : 0.55} stroke={tone} strokeLinecap="round" strokeWidth="0.75" x1={gateWidth} x2={gateWidth} y1="-2.6" y2="2.6" />
      <g transform={`translate(0 ${labelOffset}) rotate(${-angle - 90})`}>
        <rect
          fill={isActive ? tone : "oklch(0.105 0.035 270 / 0.92)"}
          height={badgeSize}
          rx="1.15"
          stroke={tone}
          strokeWidth={isActive ? 0.9 : 0.65}
          width={badgeSize}
          x={-badgeSize / 2}
          y={-badgeSize / 2}
        />
        <text
          fill={isActive ? "var(--tunnel-bg)" : "var(--ink)"}
          fontFamily="var(--font-oxanium), var(--font-sora), sans-serif"
          fontSize={labelSize}
          fontWeight="900"
          textAnchor="middle"
          y="0.95"
        >
          {weekId}
        </text>
      </g>
    </g>
  );
}

function PlayerLayer({
  activePlayerId,
  players,
  reduceMotion
}: {
  activePlayerId?: string;
  players: Player[];
  reduceMotion: boolean;
}) {
  return (
    <g>
      {players.map((player, index) => {
        const point = getRaceCarPosition(playerProgressPercent(player), index);
        const active = activePlayerId === player.id;
        return (
          <motion.g
            key={player.id}
            animate={{ x: point.x, y: point.y, rotate: point.angle + 90 }}
            initial={false}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          >
            <g transform={`scale(${active ? 0.063 : 0.054}) translate(-60 -90)`}>
              <KartGlyph color={player.color} />
            </g>
            {player.status === "boosting" && (
              <circle cx="0" cy="0" fill="none" r="4.2" stroke="var(--boost-cyan)" strokeWidth="0.7" />
            )}
            {player.status === "slowed" && (
              <circle cx="0" cy="0" fill="none" r="4.2" stroke="var(--warning-coral)" strokeWidth="0.7" />
            )}
          </motion.g>
        );
      })}
    </g>
  );
}

function TopicLayer({ compact }: { compact: boolean }) {
  if (compact) return null;

  return (
    <g aria-hidden="true" opacity="0.94">
      {COURSE_TOPIC_MARKERS.map((marker) => {
        const textAnchor = marker.anchor ?? "middle";
        const label = marker.label[0] ?? "";

        return (
          <g key={marker.label.join(" ")} transform={`translate(${marker.x} ${marker.y})`}>
            <circle fill={marker.tone} opacity="0.1" r="5.2" />
            <circle fill="oklch(0.09 0.028 270 / 0.72)" r="3.4" stroke={marker.tone} strokeOpacity="0.38" strokeWidth="0.42" />
            <RaceMapTopicIcon icon={marker.icon} tone={marker.tone} />
            <text
              fill="var(--muted)"
              fontFamily="var(--font-oxanium), var(--font-sora), sans-serif"
              fontSize="1.9"
              fontWeight="800"
              letterSpacing="0.04em"
              textAnchor={textAnchor}
              y="8.2"
            >
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function MapHeader({ compact }: { compact: boolean }) {
  return (
    <g aria-hidden="true">
      <rect fill="oklch(0.09 0.028 270 / 0.88)" height="18" rx="1.8" stroke="oklch(0.42 0.07 260 / 0.55)" strokeWidth="0.45" width="152" x="4" y="4" />
      <rect fill="url(#panelGlow)" height="18" rx="1.8" width="152" x="4" y="4" />
      <text
        fill="var(--boost-cyan)"
        fontFamily="var(--font-oxanium), var(--font-sora), sans-serif"
        fontSize="3.2"
        fontWeight="900"
        x="10"
        y="10.2"
      >
        FINANCE RALLY
      </text>
      <text fill="var(--muted)" fontSize="1.85" fontWeight="700" x="10" y="15.8">
        W1–W15 MARKED ON TRACK
      </text>
      {!compact && (
        <>
          <line stroke={ODD_CHECKPOINT_TONE} strokeLinecap="round" strokeWidth="1.1" x1="118" x2="124" y1="10.5" y2="10.5" />
          <text fill="var(--muted)" fontSize="1.75" fontWeight="700" x="126" y="11.3">
            ODD
          </text>
          <line stroke={EVEN_CHECKPOINT_TONE} strokeLinecap="round" strokeWidth="1.1" x1="118" x2="124" y1="15.5" y2="15.5" />
          <text fill="var(--muted)" fontSize="1.75" fontWeight="700" x="126" y="16.3">
            EVEN
          </text>
        </>
      )}
    </g>
  );
}

function StartFinishLine() {
  const finish = sampleCourseRoad(0);
  const angle = finish.angle + 90;

  return (
    <g aria-hidden="true">
      <text
        fill="var(--finish-green)"
        fontFamily="var(--font-oxanium), var(--font-sora), sans-serif"
        fontSize="2.6"
        fontWeight="900"
        opacity="0.92"
        x="4"
        y="48"
      >
        START
      </text>
      <g transform={`translate(${finish.x} ${finish.y}) rotate(${angle})`}>
        <rect fill="oklch(0.94 0.01 260)" height="10" opacity="0.95" transform="translate(-2 -5)" width="4" />
        {FINISH_CELLS.map((cell) => (
          <rect
            fill={cell.dark ? "oklch(0.15 0.01 260)" : "oklch(0.94 0.01 260)"}
            height="1.65"
            key={`${cell.col}-${cell.row}`}
            transform={`translate(${-2 + cell.col * 2} ${-5 + cell.row * 1.65})`}
            width="2"
          />
        ))}
      </g>
    </g>
  );
}
