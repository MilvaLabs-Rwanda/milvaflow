@AGENTS.md

# Milvaflow

An Android app that makes MTN MoMo payments in Rwanda quick: type an amount,
pick a contact or type a number / MoMo Pay code / bank account, and the app
dials the full USSD code so MTN's own prompt only asks for the PIN.

## Invariants

- **Local only.** No backend, no database, no analytics, no network calls.
  The only stored data is the recent-payments list (`src/lib/recents.ts`,
  AsyncStorage). Contacts are read on the device and never stored.
- **The app never sees the PIN.** It dials; MTN's USSD screen does the rest.
  It also can't see whether a payment succeeded, so "recent" means "attempted".
- **USSD paths live only in `src/lib/ussd.ts`**, confirmed on a real MTN SIM.
  Never change one without re-checking it on a phone.
- v1 sends from an MTN SIM only. Recipients: MTN, Airtel, MoMo Pay, bank (eKash).
- Android only (iOS doesn't let apps dial `*`/`#` codes).

## Standards

- Same engineering bar as other Milvalabs projects: no shortcuts, no dead code,
  no stubs, plain standard wording in code, copy and commits
  (Conventional Commits, no AI trailers), never commit without being asked.
- Colours, spacing, radius and type come only from `src/theme.ts`. Brand:
  navy `#2E3251`, green `#2DC296`, sky `#7AB5F8`. Text on green is navy,
  never white (contrast).
- Shared UI lives in `src/components/` with variants as props; screens don't
  restyle a component from outside. Icons: `lucide-react-native` only.
- Repeated UI is rendered from data with `.map()` and real keys.
- Pure logic lives in `src/lib/` with a colocated `*.test.ts`.

## Commands

```bash
pnpm install
pnpm android      # build and run on a device/emulator (needs JAVA_HOME + ANDROID_HOME)
pnpm start        # Metro only, once the app is installed
pnpm typecheck
pnpm lint
pnpm test
```

Before calling a change done: typecheck, lint and tests pass, and the flow
was exercised in the app on a device or emulator.
