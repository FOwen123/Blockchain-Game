# TODO

## Phase 0: Project Setup

- [x] Create `PRODUCT.md` and `DESIGN.md` to lock project and visual direction before scaffolding.
- [x] Scaffold the app with `pnpm create next-app@latest` using TypeScript, App Router, Tailwind CSS, ESLint, and Turbopack.
- [x] Install runtime dependencies: `@supabase/supabase-js`, `zustand`, `motion`, `howler`, `lucide-react`, and `zod`.
- [x] Add `.env.local.example` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [x] Create the base routes: `/`, `/play/[roomCode]`, `/host/[roomCode]`, and `/spectator/[roomCode]`.
- [x] Add a shared Tokyo Night theme in global CSS using CSS custom properties.
- [x] Confirm mobile-first layout works at 360px, 390px, 430px, tablet, and laptop projector sizes.

## Phase 1: Course Data and Quiz Content

- [x] Create a typed `weeks` data file with 15 week records.
- [x] Give each week a short title, one-sentence highlight, question, answer choices, correct answer, and spectator callout.
- [x] Keep every question lightweight and focused on topic recognition.
- [x] Add validation with `zod` so invalid week data fails during development.
- [x] Review all 15 questions for clarity, phone readability, and no deep technical dependency.
- [x] Add a fallback state if course data fails to load.

## Phase 2: Game Model

- [x] Define race states: `lobby`, `countdown`, `racing`, `checkpoint`, `finished`, and `resetting`.
- [x] Define player states: name, kart color, avatar icon, progress, current week, score, boost status, slowdown status, connected status, and finished time.
- [x] Define scoring rules: correct answer gives boost and points, wrong answer gives a short slowdown and the topic highlight.
- [x] Define finish rules for all 15 checkpoints.
- [x] Add deterministic room codes so one class session can be shared easily.
- [x] Add local-only game mode for development without Supabase.

## Phase 3: Mobile Player Experience

- [x] Build the join screen with room code, display name, and kart color selection.
- [x] Build a compact player HUD showing current place, speed, week number, score, and connection state.
- [x] Build the race track view optimized for touch screens.
- [x] Build checkpoint question screens with large answer buttons.
- [x] Show immediate feedback after each answer: boost, slowdown, and one-line topic highlight.
- [x] Add finish screen with rank, score, completion time, and replay button.
- [x] Handle refresh and reconnect without losing the player name or room.

## Phase 4: Host Controls

- [x] Build `/host/[roomCode]` for the presenter.
- [x] Add room creation and room reset controls.
- [x] Add start countdown control.
- [x] Add lock or unlock late joins.
- [x] Add kick player control for duplicate or invalid names.
- [x] Add force next checkpoint control for recovery during class.
- [x] Add end race control.
- [x] Add a visible room code and QR code for classmates to join.

## Phase 5: Spectator View

- [x] Build `/spectator/[roomCode]` for laptop or projector display.
- [x] Show the whole 15-week track with the active checkpoint highlighted.
- [x] Show player positions moving along the track.
- [x] Show the current week title, question topic, and one-line highlight.
- [x] Show a live leaderboard with rank, player name, score, and finish status.
- [x] Add a countdown and finish podium view.
- [x] Make spectator layout readable on projector aspect ratios.

## Phase 6: Multiplayer Live Sync

- [ ] Create a Supabase project for this game.
- [x] Enable Supabase Realtime.
- [x] Create a room channel naming pattern such as `race:{roomCode}`.
- [x] Implement presence sync for connected players.
- [x] Implement broadcast events for room lifecycle: create, join, start, answer, progress, finish, reset, and host override.
- [x] Add event payload schemas with `zod`.
- [x] Make the host browser the authority for room state during the race.
- [x] Persist minimal client state in local storage for reconnects.
- [x] Add reconnect handling for player and spectator views.
- [x] Add duplicate name handling.
- [x] Add stale player cleanup when someone disconnects.
- [x] Add a no-connection state that pauses actions and shows reconnect status.

## Phase 7: Race Feel and Motion

- [x] Animate countdown, checkpoint gates, boost trails, slowdown feedback, overtakes, and finish state.
- [x] Add reduced-motion alternatives for every major animation.
- [x] Add sound effects for countdown, correct answer, wrong answer, boost, checkpoint, and finish.
- [x] Add mute control and remember the setting.
- [x] Keep motion smooth on phones by animating transform and opacity.
- [x] Test that gameplay remains clear without sound.

## Phase 8: Visual Polish

- [x] Apply Tokyo Night tokens consistently across background, track, controls, states, and spectator view.
- [x] Use cyan for boost, amber for question checkpoints, coral for wrong or slowdown states, and green for finish states.
- [x] Check text contrast for all dark surfaces.
- [x] Make button labels short and action-based.
- [x] Avoid Nintendo assets, names, item designs, character references, and track references.
- [x] Add a distinctive course identity without making it look like a generic quiz app.

## Phase 9: Testing and Quality

- [x] Run `pnpm lint`.
- [x] Run `pnpm build`.
- [x] Test player flow on mobile viewport.
- [x] Test host flow on laptop viewport.
- [x] Test spectator flow on projector-sized viewport.
- [x] Test a full 15-question race locally with at least three browser tabs.
- [x] Test late join behavior.
- [x] Test refresh and reconnect behavior.
- [x] Test wrong answers, all-correct answers, and tie scenarios.
- [x] Test reduced-motion mode.
- [x] Test muted audio mode.
- [x] Test empty room and abandoned room states.

## Phase 10: Vercel Launch Preparation

- [ ] Push the project to GitHub.
- [ ] Create a Vercel project manually.
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` in Vercel environment variables.
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel environment variables.
- [ ] Confirm Vercel uses `pnpm`.
- [ ] Run the Vercel production build.
- [ ] Open the deployed site and create a test room.
- [ ] Test one host, one spectator, and at least two phone players on the deployed URL.
- [ ] Confirm Supabase Realtime works from the deployed Vercel domain.
- [ ] Confirm QR code join works from phones.
- [ ] Confirm the final class launch URL is ready to share.

## Phase 11: Class Launch Runbook

- [ ] Open the host page on the laptop.
- [ ] Open the spectator page on the projector or shared screen.
- [ ] Create a room and display the QR code.
- [ ] Wait for classmates to join on phones.
- [ ] Lock joins when ready.
- [ ] Start countdown.
- [ ] Monitor player progress and connection state.
- [ ] Use host override only if the race gets stuck.
- [ ] Show final podium.
- [ ] Keep the room code and reset button available for a second run.
