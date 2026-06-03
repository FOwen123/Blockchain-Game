---
name: Tokyo Chain Rally
description: A phone-first Tokyo Night racing quiz for the Financial Blockchain 15-week course.
colors:
  midnight-track: "oklch(0.205 0.040 269)"
  tunnel-bg: "oklch(0.155 0.035 270)"
  panel: "oklch(0.245 0.040 267)"
  panel-raised: "oklch(0.305 0.045 267)"
  line: "oklch(0.430 0.055 266)"
  ink: "oklch(0.925 0.025 257)"
  muted: "oklch(0.720 0.045 255)"
  boost-cyan: "oklch(0.820 0.145 205)"
  gate-violet: "oklch(0.715 0.155 286)"
  checkpoint-amber: "oklch(0.830 0.145 78)"
  warning-coral: "oklch(0.735 0.165 25)"
  finish-green: "oklch(0.790 0.135 150)"
typography:
  display:
    fontFamily: "Oxanium, Sora, system-ui, sans-serif"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0"
  headline:
    fontFamily: "Oxanium, Sora, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0"
  title:
    fontFamily: "Sora, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0"
  body:
    fontFamily: "Sora, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0"
  label:
    fontFamily: "Sora, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.boost-cyan}"
    textColor: "{colors.tunnel-bg}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "14px 18px"
  button-danger:
    backgroundColor: "{colors.warning-coral}"
    textColor: "{colors.tunnel-bg}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "14px 18px"
  chip-week:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 12px"
  answer-button:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "16px"
---

# Design System: Tokyo Chain Rally

<!-- SEED -->

## 1. Overview

**Creative North Star: "Night Circuit Classroom"**

Tokyo Chain Rally feels like a late-night arcade race projected into a Financial Blockchain classroom. The system uses the Tokyo Night editor mood as atmosphere, but the interface is a racing game first: fast checkpoints, visible progress, large phone controls, and a clear projector story.

The design should feel electric and focused, not chaotic. Mobile players need large tap targets and direct feedback; the spectator view needs theatrical track movement, leaderboard clarity, and readable topic callouts from across a classroom.

**Key Characteristics:**

- Dark Tokyo Night surfaces with cyan, amber, violet, coral, and green as functional race signals.
- Phone-first controls with 44px minimum tap targets and no hidden hover-only behavior.
- Projector-first spectator hierarchy: track, player positions, current week, leaderboard.
- Arcade motion that explains state: boost, slowdown, checkpoint, countdown, finish.
- No Nintendo trade dress, crypto casino styling, or dense finance lecture treatment.

## 2. Colors

The palette is a Tokyo Night race circuit: deep navy lanes, luminous checkpoint energy, and sharp state colors that stay readable on phone screens.

### Primary

- **Midnight Track** (`oklch(0.205 0.040 269)`): Main track and dark structural surface. Use it for the race world, not for every UI panel.
- **Boost Cyan** (`oklch(0.820 0.145 205)`): Primary action, active player energy, correct-answer boost, and progress trails.

### Secondary

- **Gate Violet** (`oklch(0.715 0.155 286)`): Checkpoint gates, spectator week markers, and momentary race effects. Keep it secondary so the app does not become purple-heavy.
- **Checkpoint Amber** (`oklch(0.830 0.145 78)`): Question markers, countdown emphasis, and the active week indicator.

### Tertiary

- **Warning Coral** (`oklch(0.735 0.165 25)`): Wrong answer, slowdown, host danger actions, and connection problems.
- **Finish Green** (`oklch(0.790 0.135 150)`): Finish line, completed week states, and success feedback.

### Neutral

- **Tunnel Background** (`oklch(0.155 0.035 270)`): App background and full-screen spectator foundation.
- **Panel** (`oklch(0.245 0.040 267)`): HUD panels, answer surfaces, host controls, and leaderboard rows.
- **Panel Raised** (`oklch(0.305 0.045 267)`): Pressable surfaces and selected controls.
- **Circuit Line** (`oklch(0.430 0.055 266)`): Borders, dividers, lane marks, and disabled outlines.
- **Ink** (`oklch(0.925 0.025 257)`): Primary text on dark surfaces.
- **Muted** (`oklch(0.720 0.045 255)`): Secondary labels and helper text. Do not use below 14px.

### Named Rules

**The Functional Neon Rule.** Cyan, amber, violet, coral, and green must describe game state. Do not use them as random decoration.

**The Purple Ceiling Rule.** Violet supports gates and effects only. The dominant read should be night track plus cyan and amber, not a purple gradient UI.

## 3. Typography

**Display Font:** Oxanium with Sora and system sans fallback  
**Body Font:** Sora with system sans fallback  
**Label/Mono Font:** Use Sora labels by default. Add a true mono only if the implementation later needs code-like debug readouts.

**Character:** Oxanium gives the race a mechanical arcade voice without copying a console game. Sora keeps phone UI readable and modern for long labels, questions, and class topic names.

### Hierarchy

- **Display** (700, 48px desktop, 36px mobile, line-height 1): Room title, countdown number, finish podium headline.
- **Headline** (700, 32px desktop, 26px mobile, line-height 1.1): Current week title, spectator checkpoint heading.
- **Title** (700, 22px, line-height 1.2): Question prompt, panel titles, leaderboard section names.
- **Body** (400, 16px, line-height 1.55): Question options, topic highlights, host instructions, reconnect messages. Cap prose at 65ch.
- **Label** (700, 13px, line-height 1.2): HUD labels, player status, room code labels, week chips. Letter spacing stays 0.

### Named Rules

**The Phone Legibility Rule.** No UI text below 13px. Long week titles wrap to two lines before shrinking.

**The No Fake Terminal Rule.** Tokyo Night does not mean every label becomes monospace. Use code-editor influence in color and density, not in unreadable typography.

## 4. Elevation

Depth is mostly tonal and luminous, not soft card shadows. Racing surfaces should feel embedded in a night circuit; buttons and active objects glow only when they are interactive, selected, boosted, or in motion.

### Shadow Vocabulary

- **Interactive Glow** (`0 0 0 1px oklch(0.820 0.145 205 / 0.55), 0 0 18px oklch(0.820 0.145 205 / 0.28)`): Focused or active primary controls.
- **Checkpoint Glow** (`0 0 0 1px oklch(0.830 0.145 78 / 0.50), 0 0 22px oklch(0.830 0.145 78 / 0.28)`): Active checkpoint gates and current week markers.
- **Danger Glow** (`0 0 0 1px oklch(0.735 0.165 25 / 0.55), 0 0 18px oklch(0.735 0.165 25 / 0.24)`): Wrong answer, connection failure, and destructive host controls.

### Named Rules

**The Glow-As-State Rule.** Glow appears only for interaction, focus, race energy, or feedback. Static panels stay flat.

## 5. Components

Components should feel like clean arcade instrumentation: compact, sharp, readable, and fast to operate on phones.

### Buttons

- **Shape:** Compact rounded rectangle, never over-rounded (`8px` max except icon pills and chips).
- **Primary:** Boost Cyan fill with Tunnel Background text, `14px 18px` padding, minimum height `44px`.
- **Hover / Focus:** Shift to a raised tonal surface or apply Interactive Glow. Focus states must be visible without relying on color alone.
- **Secondary / Ghost:** Transparent or Panel background with Circuit Line border. Use for host controls, spectator links, and less frequent actions.
- **Danger:** Warning Coral fill for reset, end race, kick player, and connection recovery actions.

### Chips

- **Style:** Pill chips for week number, room code, player status, and connection state.
- **State:** Selected chips use Checkpoint Amber or Boost Cyan depending on meaning. Disabled chips use Panel with Muted text and no glow.

### Cards / Containers

- **Corner Style:** Use `8px` for panels and answer buttons.
- **Background:** Panel at rest, Panel Raised for selected or pressable states.
- **Shadow Strategy:** No soft card shadows. Use tonal contrast, line borders, and state glows.
- **Border:** Circuit Line at `1px`, full border only. Do not use side stripes.
- **Internal Padding:** `16px` on mobile panels, `24px` on spectator and host panels.

### Inputs / Fields

- **Style:** Panel background, Circuit Line border, `8px` radius, `44px` minimum height.
- **Focus:** Boost Cyan border plus Interactive Glow.
- **Error / Disabled:** Warning Coral for invalid room codes or duplicate names. Disabled fields use Muted text and lower contrast panel fill.

### Navigation

- **Style:** The first screen should route directly into join, host, or spectator mode. Use a compact mode switch, not a marketing nav bar.
- **Mobile Treatment:** Bottom or top segmented control for mode changes when needed.
- **Active State:** Active mode uses Boost Cyan text and a small filled indicator.

### Race Track

- **Player View:** Show one readable track segment, current checkpoint, player kart marker, speed feedback, and answer state.
- **Spectator View:** Show all 15 checkpoints as a full race map with active week emphasis, player positions, and leaderboard.
- **Motion:** Player markers move with transform-based animation. Wrong answers should slow or pulse, not throw the player around.

### Question Checkpoint

- **Prompt:** Use Title typography and keep question text short.
- **Answer Buttons:** Full-width on phones, at least `44px` high, with enough vertical spacing for fast tapping.
- **Feedback:** Correct shows Boost Cyan and a short speed burst. Wrong shows Warning Coral and the one-line topic highlight.

## 6. Do's and Don'ts

### Do:

- **Do** make the race the first useful screen. Players should enter a room and start quickly.
- **Do** use Tokyo Night as a functional race palette: dark track, cyan boost, amber questions, violet gates, coral slowdown, green finish.
- **Do** keep each checkpoint focused on one big course topic and one lightweight question.
- **Do** make spectator view readable from a laptop or projector, with track, current week, leaderboard, and room code visible.
- **Do** keep tap targets at least `44px` and test at 360px mobile width.
- **Do** include reduced-motion behavior for countdown, boosts, gates, and finish animations.
- **Do** use full borders, tonal panels, and state glows instead of decorative side accents.

### Don't:

- **Don't** make the game look childish, like a crypto casino, or like a literal clone of Mario Kart.
- **Don't** use Nintendo characters, assets, names, tracks, items, or trade dress.
- **Don't** turn the experience into a dense blockchain lesson or a generic quiz page with decorative cards.
- **Don't** use dark UI that becomes unreadable on phones.
- **Don't** use excessive purple gradients or let violet dominate the interface.
- **Don't** use casino-like token visuals, coin rain, slot-machine motion, or speculative trading language.
- **Don't** add complicated controls that slow down a classroom session.
- **Don't** use side-stripe borders, gradient text, decorative glass panels, nested cards, or repeated tiny uppercase section labels.
