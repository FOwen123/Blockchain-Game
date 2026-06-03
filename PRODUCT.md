# Product

## Register

brand

## Users

The primary players are classmates taking Financial Blockchain Management and Practice. They will mostly play on phones during class, using a short interactive race to recognize the 15-week course arc without needing deep technical mastery.

The presenter uses a laptop or projector as a spectator view. That screen shows the full race state, current topic, player positions, and progress so the class can follow the game together.

## Product Purpose

This project is an interactive web racing game that highlights the course topics from 15 weeks of Financial Blockchain Management and Practice. Each checkpoint represents one week and asks one lightweight question about that week's big idea.

Success means classmates can play quickly on phones, understand the course journey at a glance, and remember the broad sequence of topics: DLT, cryptography, consensus, smart contracts, stablecoins, CBDCs, DeFi, tokenization, enterprise blockchain, insurance, identity, regulation, and risk.

## Brand Personality

Arcade, focused, electric.

The visual direction uses a Tokyo Night inspired palette: deep navy asphalt, indigo track surfaces, cyan boost energy, violet gates, amber question markers, and coral warning states. The tone should feel like a night race through a finance blockchain course, with enough energy for a classroom game and enough clarity for phone screens.

## Anti-references

Do not make the game look childish, like a crypto casino, or like a literal clone of Mario Kart. Do not use Nintendo characters, assets, names, tracks, items, or trade dress. Do not turn the experience into a dense blockchain lesson or a generic quiz page with decorative cards.

Avoid dark UI that becomes unreadable on phones, excessive purple gradients, casino-like token visuals, and complicated controls that slow down a classroom session.

## Design Principles

1. Start with the race, not an explanation page. The first screen should get players into a room and onto the track quickly.
2. One topic, one question, one highlight. Every checkpoint should teach the big idea in a few seconds.
3. Phones drive the game, the projector tells the story. The mobile player view should be simple and touch-first; the spectator view should show the full race and current week clearly.
4. Keep multiplayer resilient. The game should tolerate reconnects, late joins, accidental refreshes, and slow classroom Wi-Fi.
5. Use motion as feedback. Boosts, slowdowns, checkpoint gates, and finish states should animate the result of a player action.

## Course Content

1. Week 1: Introduction to Distributed Ledger Technology and the Evolution of Money
2. Week 2: Cryptography Essentials for Financial Managers
3. Week 3: Consensus Mechanisms and Green Finance
4. Week 4: Smart Contracts and Automation
5. Week 5: Stablecoins and the Future of Payments
6. Week 6: Central Bank Digital Currencies
7. Week 7: Decentralized Finance I, Lending and Borrowing
8. Week 8: Midterm Report
9. Week 9: DeFi II, Decentralized Exchanges and AMMs
10. Week 10: Tokenization of Real World Assets
11. Week 11: Enterprise Blockchain and Supply Chain Finance
12. Week 12: Blockchain in Insurance
13. Week 13: Digital Identity and Privacy, Zero-Knowledge Proofs
14. Week 14: Financial Crime, Regulation and Compliance
15. Week 15: Risk Management and Auditing in Blockchain

## Technical Direction

Use `pnpm` with Next.js App Router, TypeScript, Tailwind CSS, and Turbopack. The game loop should run in the browser for speed and responsiveness.

Use Supabase Realtime for multiplayer live sync because the app will be deployed on Vercel manually. Supabase Realtime supports room channels, presence, and broadcast events without hosting a persistent WebSocket server inside Vercel.

Recommended libraries:

- `@supabase/supabase-js` for Realtime channels, presence, and room events.
- `zustand` for local race state.
- `motion` for checkpoint, boost, slowdown, and finish animations.
- `howler` for lightweight sound effects.
- `lucide-react` for UI icons.
- `zod` for validating room events and question data.

## Accessibility & Inclusion

Target WCAG AA contrast and keyboard reachable controls. Phone screens are the primary player device, so tap targets should be at least 44px and critical text should remain readable at small sizes.

Provide a reduced-motion mode that keeps the game playable without fast camera movement, shake effects, or intense transitions. Do not rely on color alone for correct, wrong, boost, or slowdown states.
