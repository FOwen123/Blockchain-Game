"use client";

type KartModelProps = {
  color: string;
  accent?: string;
  className?: string;
  ariaLabel?: string;
};

type KartGlyphProps = {
  color: string;
  accent?: string;
};

const defaultAccent = "var(--boost-cyan)";

export function KartModel({
  color,
  accent = defaultAccent,
  className,
  ariaLabel = "Selected racer car"
}: KartModelProps) {
  return (
    <svg className={className} viewBox="0 0 120 180" role="img" aria-label={ariaLabel}>
      <defs>
        <filter id="kartModelGlow" x="-35%" y="-25%" width="170%" height="150%">
          <feDropShadow dx="0" dy="6" floodColor="oklch(0.82 0.145 205 / 0.36)" stdDeviation="5" />
        </filter>
      </defs>
      <g filter="url(#kartModelGlow)">
        <KartGlyph color={color} accent={accent} />
      </g>
    </svg>
  );
}

export function KartGlyph({ color, accent = defaultAccent }: KartGlyphProps) {
  return (
    <g>
      <ellipse cx="60" cy="100" fill={color} opacity="0.18" rx="35" ry="77" />
      <image
        height="180"
        href="/car_avatar.png"
        opacity="0.96"
        preserveAspectRatio="xMidYMid meet"
        width="180"
        x="-30"
        y="0"
      />
      <path
        d="M 42 45 L 31 68 L 33 103 M 78 45 L 89 68 L 87 103 M 45 132 L 38 153 M 75 132 L 82 153"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
      <path
        d="M 51 36 L 60 30 L 69 36 M 60 45 V 63 M 60 114 V 158"
        fill="none"
        stroke={accent}
        strokeLinecap="round"
        strokeWidth="2.8"
      />
      <path
        d="M 38 153 H 51 M 69 153 H 82"
        fill="none"
        stroke="oklch(0.88 0.11 330)"
        strokeLinecap="round"
        strokeWidth="5.4"
      />
    </g>
  );
}
