import type { CourseTopicIcon } from "@/lib/game/courseMap";

type Props = {
  icon: CourseTopicIcon;
  tone: string;
};

export function RaceMapTopicIcon({ icon, tone }: Props) {
  if (icon === "cubes") {
    return (
      <g fill="none" stroke={tone} strokeLinejoin="round" strokeWidth="0.9" transform="translate(0 -1)">
        <path d="M -2.5 -4 L 0 -5.5 L 2.5 -4 V -1 L 0 0.5 L -2.5 -1 Z" />
        <path d="M -6 1 L -3.5 -0.5 L -1 1 V 4 L -3.5 5.5 L -6 4 Z" />
        <path d="M 1 1 L 3.5 -0.5 L 6 1 V 4 L 3.5 5.5 L 1 4 Z" />
      </g>
    );
  }

  if (icon === "wallet") {
    return (
      <g fill="none" stroke={tone} strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9">
        <path d="M -6 -3.5 H 4.2 A 2.2 2.2 0 0 1 6.4 -1.3 V 4.6 H -6 Z" />
        <path d="M -5.1 -4.6 H 3.2" />
        <path d="M 1.8 0 H 6.4 V 2.8 H 1.8 A 1.4 1.4 0 0 1 1.8 0 Z" />
        <circle cx="3.5" cy="1.4" r="0.45" />
      </g>
    );
  }

  if (icon === "contract") {
    return (
      <g fill="none" stroke={tone} strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.85">
        <path d="M -4.7 -5.8 H 2.4 L 5.2 -3 V 6 H -4.7 Z" />
        <path d="M 2.4 -5.8 V -3 H 5.2" />
        <path d="M -2.8 -1.8 L -0.6 -3.2 M 0.6 -3.2 L -1.4 1.4 M 1 1.4 L 3 -0.1" />
        <circle cx="3.5" cy="4" r="1.8" />
        <path d="M 2.8 4 L 3.4 4.7 L 4.5 3.3" />
      </g>
    );
  }

  if (icon === "coins") {
    return (
      <g fill="none" stroke={tone} strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9">
        <ellipse cx="0" cy="-3.4" rx="5" ry="2.1" />
        <path d="M -5 -3.4 V 2.6 C -5 3.8 -2.8 4.7 0 4.7 C 2.8 4.7 5 3.8 5 2.6 V -3.4" />
        <path d="M -5 -0.4 C -5 1 -2.8 1.8 0 1.8 C 2.8 1.8 5 1 5 -0.4" />
        <circle cx="5.7" cy="3.4" r="2" />
        <path d="M 5.7 2.3 V 4.5 M 4.8 3.4 H 6.6" />
      </g>
    );
  }

  if (icon === "shield") {
    return (
      <g fill="none" stroke={tone} strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9">
        <path d="M 0 -6 L 5 -3.8 V 0.7 C 5 4 -0.1 6 -0.1 6 C -0.1 6 -5 4 -5 0.7 V -3.8 Z" />
        <rect height="4" rx="0.8" width="4.8" x="-2.4" y="-0.7" />
        <path d="M -1.6 -0.8 V -1.8 A 1.6 1.6 0 0 1 1.6 -1.8 V -0.8" />
      </g>
    );
  }

  if (icon === "chart") {
    return (
      <g fill="none" stroke={tone} strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9">
        <path d="M -5 5 H 5" />
        <path d="M -4 2 L -1.3 -1.3 L 1.2 0.4 L 4.5 -4.5" />
        <path d="M 4.5 -4.5 L 4.3 -2 M 4.5 -4.5 L 2 -4.2" />
      </g>
    );
  }

  if (icon === "bridge") {
    return (
      <g fill="none" stroke={tone} strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.85">
        <path d="M -6 4 H 6" />
        <path d="M -5 2 C -2 0 2 0 5 2" />
        <path d="M -4 -4 V 4 M 4 -4 V 4" />
        <path d="M -6 -1 L -4 -4 L -2 -1 M 2 -1 L 4 -4 L 6 -1" />
      </g>
    );
  }

  return (
    <g fill="none" stroke={tone} strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9">
      <circle cx="0" cy="0" r="2" />
      <circle cx="-5" cy="-3.5" r="1.1" />
      <circle cx="5" cy="-3.5" r="1.1" />
      <circle cx="-5" cy="3.5" r="1.1" />
      <circle cx="5" cy="3.5" r="1.1" />
      <path d="M -3.9 -2.7 L -1.7 -1 M 3.9 -2.7 L 1.7 -1 M -3.9 2.7 L -1.7 1 M 3.9 2.7 L 1.7 1" />
    </g>
  );
}
