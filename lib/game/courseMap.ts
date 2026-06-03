import { weeks } from "./weeks";
import type { WeekTopic } from "./types";

export type CourseMapPoint = { x: number; y: number };
export type CourseTopicIcon = "nodes" | "cubes" | "wallet" | "contract" | "coins" | "shield" | "chart" | "bridge";

export type CourseTopicMarker = {
  icon: CourseTopicIcon;
  label: string[];
  x: number;
  y: number;
  tone: string;
  anchor?: "start" | "middle" | "end";
};

export type CourseCheckpoint = {
  week: WeekTopic;
  x: number;
  y: number;
  angle: number;
  tone: string;
};

export type CourseDirectionMarker = {
  x: number;
  y: number;
  angle: number;
  tone: string;
};

type CourseCurveSegment = {
  from: CourseMapPoint;
  controlA: CourseMapPoint;
  controlB: CourseMapPoint;
  to: CourseMapPoint;
};

type CourseRoadLookupPoint = CourseMapPoint & {
  distance: number;
};

type CourseRoadLookup = {
  samples: CourseRoadLookupPoint[];
  total: number;
};

export const COURSE_MAP_VIEWBOX = "0 0 160 90";
export const COURSE_MAP_WIDTH = 160;
export const COURSE_MAP_HEIGHT = 90;
export const ODD_CHECKPOINT_TONE = "var(--gate-violet)";
export const EVEN_CHECKPOINT_TONE = "var(--boost-cyan)";

/** Smooth outer loop with an inner chicane — readable at projector scale. */
export const COURSE_ROAD_POINTS: CourseMapPoint[] = [
  { x: 14, y: 54 },
  { x: 30, y: 54 },
  { x: 44, y: 50 },
  { x: 54, y: 40 },
  { x: 60, y: 24 },
  { x: 76, y: 16 },
  { x: 100, y: 16 },
  { x: 122, y: 22 },
  { x: 136, y: 36 },
  { x: 146, y: 52 },
  { x: 140, y: 68 },
  { x: 118, y: 76 },
  { x: 90, y: 76 },
  { x: 70, y: 66 },
  { x: 78, y: 50 },
  { x: 106, y: 46 },
  { x: 116, y: 56 },
  { x: 98, y: 66 },
  { x: 64, y: 66 },
  { x: 50, y: 58 },
  { x: 34, y: 56 },
  { x: 14, y: 54 }
];

const COURSE_ROAD_SAMPLE_STEPS = 20;
const COURSE_ROAD_LOOKUP = buildCourseRoadLookup(COURSE_ROAD_POINTS);

/** Sparse star field placed away from the racing line. */
export const COURSE_BACKGROUND_DOTS = [
  { x: 8, y: 10, opacity: 0.28 },
  { x: 18, y: 22, opacity: 0.18 },
  { x: 28, y: 8, opacity: 0.22 },
  { x: 42, y: 6, opacity: 0.16 },
  { x: 68, y: 5, opacity: 0.24 },
  { x: 92, y: 7, opacity: 0.2 },
  { x: 118, y: 6, opacity: 0.18 },
  { x: 138, y: 10, opacity: 0.26 },
  { x: 152, y: 24, opacity: 0.2 },
  { x: 154, y: 48, opacity: 0.16 },
  { x: 150, y: 72, opacity: 0.22 },
  { x: 132, y: 84, opacity: 0.18 },
  { x: 108, y: 86, opacity: 0.24 },
  { x: 82, y: 85, opacity: 0.16 },
  { x: 56, y: 84, opacity: 0.2 },
  { x: 32, y: 82, opacity: 0.18 },
  { x: 10, y: 72, opacity: 0.22 },
  { x: 6, y: 42, opacity: 0.16 },
  { x: 22, y: 38, opacity: 0.2 },
  { x: 48, y: 30, opacity: 0.14 },
  { x: 128, y: 48, opacity: 0.18 },
  { x: 124, y: 64, opacity: 0.14 },
  { x: 86, y: 38, opacity: 0.16 },
  { x: 62, y: 48, opacity: 0.12 }
];

export const COURSE_TOPIC_MARKERS: CourseTopicMarker[] = [
  { icon: "nodes", label: ["DLT"], x: 68, y: 28, tone: ODD_CHECKPOINT_TONE },
  { icon: "cubes", label: ["BLOCKCHAIN"], x: 104, y: 26, tone: ODD_CHECKPOINT_TONE },
  { icon: "wallet", label: ["WALLETS"], x: 142, y: 24, tone: EVEN_CHECKPOINT_TONE, anchor: "end" },
  { icon: "wallet", label: ["CBDC"], x: 148, y: 58, tone: EVEN_CHECKPOINT_TONE, anchor: "end" },
  { icon: "contract", label: ["CONTRACTS"], x: 88, y: 42, tone: ODD_CHECKPOINT_TONE },
  { icon: "coins", label: ["DEFI"], x: 112, y: 50, tone: ODD_CHECKPOINT_TONE },
  { icon: "chart", label: ["TOKENOMICS"], x: 52, y: 34, tone: "var(--checkpoint-amber)", anchor: "start" },
  { icon: "coins", label: ["GAS FEES"], x: 38, y: 48, tone: "var(--checkpoint-amber)", anchor: "start" },
  { icon: "shield", label: ["SECURITY"], x: 72, y: 72, tone: EVEN_CHECKPOINT_TONE },
  { icon: "nodes", label: ["DAO"], x: 104, y: 70, tone: ODD_CHECKPOINT_TONE },
  { icon: "bridge", label: ["BRIDGES"], x: 132, y: 72, tone: EVEN_CHECKPOINT_TONE, anchor: "end" }
];

export const COURSE_DIRECTION_MARKERS: CourseDirectionMarker[] = [
  0.1, 0.28, 0.46, 0.62, 0.78, 0.92
].map((progress, index) => {
  const sampled = sampleCourseRoad(progress);
  return {
    x: sampled.x,
    y: sampled.y,
    angle: sampled.angle,
    tone: index % 2 === 0 ? EVEN_CHECKPOINT_TONE : ODD_CHECKPOINT_TONE
  };
});

export const COURSE_CHECKPOINTS: CourseCheckpoint[] = weeks.map((week, index) => {
  const sampled = sampleCourseRoad(index / (weeks.length - 1));
  return {
    week,
    x: sampled.x,
    y: sampled.y,
    angle: sampled.angle,
    tone: getCheckpointTone(week.id)
  };
});

export function getCheckpointTone(weekId: number) {
  return weekId % 2 === 0 ? EVEN_CHECKPOINT_TONE : ODD_CHECKPOINT_TONE;
}

export function buildCourseRoadPath(points = COURSE_ROAD_POINTS) {
  const first = points[0];
  if (!first) return "";

  return buildCourseCurveSegments(points).reduce(
    (path, segment) =>
      `${path} C ${fmt(segment.controlA.x)} ${fmt(segment.controlA.y)} ${fmt(segment.controlB.x)} ${fmt(segment.controlB.y)} ${fmt(segment.to.x)} ${fmt(segment.to.y)}`,
    `M ${fmt(first.x)} ${fmt(first.y)}`
  );
}

export function getRaceCarPosition(percent: number, lane: number) {
  const progress = Math.max(0, Math.min(100, percent)) / 100;
  const sampled = sampleCourseRoad(progress);
  const laneOffset = ((lane % 5) - 2) * 1.1;
  const radians = ((sampled.angle + 90) * Math.PI) / 180;

  return {
    x: sampled.x + Math.cos(radians) * laneOffset,
    y: sampled.y + Math.sin(radians) * laneOffset,
    angle: sampled.angle
  };
}

export function sampleCourseRoad(progress: number) {
  const { samples, total } = COURSE_ROAD_LOOKUP;
  const first = samples[0] ?? { x: 0, y: 0, distance: 0 };
  if (samples.length < 2 || total <= 0) return { x: first.x, y: first.y, angle: 0 };

  const targetDistance = Math.max(0, Math.min(1, progress)) * total;

  for (let index = 1; index < samples.length; index += 1) {
    const from = samples[index - 1];
    const to = samples[index];
    if (targetDistance <= to.distance || index === samples.length - 1) {
      const segmentDistance = to.distance - from.distance;
      const t = segmentDistance === 0 ? 0 : (targetDistance - from.distance) / segmentDistance;
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t;
      const angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
      return { x, y, angle };
    }
  }

  const last = samples[samples.length - 1];
  const previous = samples[samples.length - 2] ?? last;
  return {
    x: last.x,
    y: last.y,
    angle: (Math.atan2(last.y - previous.y, last.x - previous.x) * 180) / Math.PI
  };
}

function buildCourseCurveSegments(points = COURSE_ROAD_POINTS): CourseCurveSegment[] {
  const first = points[0];
  if (!first || points.length < 2) return [];

  return points.slice(1).map((next, index) => {
    const previous = points[index - 1] ?? first;
    const current = points[index];
    const afterNext = points[index + 2] ?? next;

    return {
      from: current,
      controlA: {
        x: current.x + (next.x - previous.x) / 6,
        y: current.y + (next.y - previous.y) / 6
      },
      controlB: {
        x: next.x - (afterNext.x - current.x) / 6,
        y: next.y - (afterNext.y - current.y) / 6
      },
      to: next
    };
  });
}

function buildCourseRoadLookup(points = COURSE_ROAD_POINTS): CourseRoadLookup {
  const first = points[0];
  if (!first) return { samples: [], total: 0 };

  const samples: CourseRoadLookupPoint[] = [{ ...first, distance: 0 }];
  let previous = first;
  let total = 0;

  for (const segment of buildCourseCurveSegments(points)) {
    for (let step = 1; step <= COURSE_ROAD_SAMPLE_STEPS; step += 1) {
      const point = sampleCurveSegment(segment, step / COURSE_ROAD_SAMPLE_STEPS);
      total += Math.hypot(point.x - previous.x, point.y - previous.y);
      samples.push({ ...point, distance: total });
      previous = point;
    }
  }

  return { samples, total };
}

function sampleCurveSegment(segment: CourseCurveSegment, t: number): CourseMapPoint {
  const oneMinusT = 1 - t;
  const a = oneMinusT ** 3;
  const b = 3 * oneMinusT ** 2 * t;
  const c = 3 * oneMinusT * t ** 2;
  const d = t ** 3;

  return {
    x: a * segment.from.x + b * segment.controlA.x + c * segment.controlB.x + d * segment.to.x,
    y: a * segment.from.y + b * segment.controlA.y + c * segment.controlB.y + d * segment.to.y
  };
}

function fmt(value: number) {
  return value.toFixed(2);
}
